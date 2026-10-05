#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { createHash, createPublicKey, X509Certificate, verify, constants } from "node:crypto";

const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/verify-apk.mjs <release.apk>");
const apk = await readFile(file);
const u32 = (buffer, offset) => buffer.readUInt32LE(offset);
const u64 = (buffer, offset) => Number(buffer.readBigUInt64LE(offset));
const lp = (buffer, offset = 0) => {
  if (offset + 4 > buffer.length) throw new Error("Invalid APK length-prefixed data.");
  const length = u32(buffer, offset);
  const start = offset + 4;
  if (start + length > buffer.length) throw new Error("Invalid APK length-prefixed data.");
  return { value: buffer.subarray(start, start + length), next: start + length };
};
const records = (buffer) => {
  const result = [];
  let offset = 0;
  while (offset < buffer.length) {
    const record = lp(buffer, offset);
    result.push(record.value);
    offset = record.next;
  }
  return result;
};
const eocd = apk.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
if (eocd < 0 || apk.readUInt16LE(eocd + 20) + eocd + 22 !== apk.length) throw new Error("APK has no valid ZIP end record.");
const directoryOffset = u32(apk, eocd + 16);
if (directoryOffset < 32 || apk.toString("ascii", directoryOffset - 16, directoryOffset) !== "APK Sig Block 42") throw new Error("APK has no v2/v3 signing block.");
const blockSize = u64(apk, directoryOffset - 24);
const blockStart = directoryOffset - blockSize - 8;
if (blockStart < 0 || u64(apk, blockStart) !== blockSize) throw new Error("APK signing block is malformed.");

let v2 = null;
for (let offset = blockStart + 8; offset < directoryOffset - 24;) {
  const length = u64(apk, offset);
  const id = u32(apk, offset + 8);
  const valueStart = offset + 12;
  if (length < 4 || valueStart + length - 4 > directoryOffset - 24) throw new Error("APK signing block entry is malformed.");
  if (id === 0x7109871a) v2 = apk.subarray(valueStart, valueStart + length - 4);
  offset += 8 + length;
}
if (!v2) throw new Error("APK v2 signature scheme is missing.");

const signer = records(records(v2)[0])[0];
const signedData = lp(signer);
const signatures = lp(signer, signedData.next);
const publicKeyBytes = lp(signer, signatures.next).value;
const signedParts = records(signedData.value);
if (signedParts.length < 2) throw new Error("APK signed data is incomplete.");
const digestRecords = records(signedParts[0]).map((record) => ({ id: u32(record, 0), digest: lp(record, 4).value }));
const signatureRecords = records(signatures.value).map((record) => ({ id: u32(record, 0), signature: lp(record, 4).value }));
const algorithms = [
  [0x0102, "sha512", constants.RSA_PKCS1_PSS_PADDING, 64], [0x0101, "sha256", constants.RSA_PKCS1_PSS_PADDING, 32],
  [0x0104, "sha512", constants.RSA_PKCS1_PADDING], [0x0103, "sha256", constants.RSA_PKCS1_PADDING],
  [0x0202, "sha512", undefined], [0x0201, "sha256", undefined],
];
let selected = null;
for (const [id, digest, padding, saltLength] of algorithms) {
  const signature = signatureRecords.find((item) => item.id === id);
  const contentDigest = digestRecords.find((item) => item.id === id);
  if (signature && contentDigest) { selected = { id, digest, padding, saltLength, signature: signature.signature, expectedDigest: contentDigest.digest }; break; }
}
if (!selected) throw new Error("APK has no supported SHA-256 or SHA-512 v2 signature.");
const certDer = records(signedParts[1])[0];
const certificate = new X509Certificate(certDer);
const key = createPublicKey({ key: publicKeyBytes, format: "der", type: "spki" });
const verifierOptions = selected.padding === undefined ? key : {
  key, padding: selected.padding, ...(selected.padding === constants.RSA_PKCS1_PSS_PADDING ? { saltLength: selected.saltLength } : {}),
};
if (!verify(selected.digest, signedData.value, verifierOptions, selected.signature)) throw new Error("APK v2 signature verification failed.");

const patchedEocd = Buffer.from(apk.subarray(eocd));
patchedEocd.writeUInt32LE(blockStart, 16);
const sections = [apk.subarray(0, blockStart), apk.subarray(directoryOffset, eocd), patchedEocd];
const chunkHashes = [];
for (const section of sections) {
  for (let offset = 0; offset < section.length; offset += 1024 * 1024) {
    const chunk = section.subarray(offset, Math.min(offset + 1024 * 1024, section.length));
    const size = Buffer.alloc(4); size.writeUInt32LE(chunk.length);
    chunkHashes.push(createHash(selected.digest).update(Buffer.from([0xa5])).update(size).update(chunk).digest());
  }
}
const chunkCount = Buffer.alloc(4); chunkCount.writeUInt32LE(chunkHashes.length);
const actualDigest = createHash(selected.digest).update(Buffer.from([0x5a])).update(chunkCount).update(Buffer.concat(chunkHashes)).digest();
if (!actualDigest.equals(selected.expectedDigest)) throw new Error("APK content digest verification failed.");

const directoryEnd = eocd;
const entryCount = apk.readUInt16LE(eocd + 10);
let cursor = directoryOffset;
let manifestOffset = -1, manifestCompressed = 0, manifestSize = 0, manifestMethod = -1;
for (let index = 0; index < entryCount; index++) {
  if (u32(apk, cursor) !== 0x02014b50) throw new Error("APK ZIP directory is malformed.");
  const nameLength = apk.readUInt16LE(cursor + 28), extraLength = apk.readUInt16LE(cursor + 30), commentLength = apk.readUInt16LE(cursor + 32);
  const name = apk.toString("utf8", cursor + 46, cursor + 46 + nameLength);
  if (name === "AndroidManifest.xml") {
    manifestMethod = apk.readUInt16LE(cursor + 10); manifestCompressed = u32(apk, cursor + 20); manifestSize = u32(apk, cursor + 24); manifestOffset = u32(apk, cursor + 42);
  }
  cursor += 46 + nameLength + extraLength + commentLength;
}
if (cursor > directoryEnd || manifestOffset < 0) throw new Error("APK manifest is missing.");
const nameLength = apk.readUInt16LE(manifestOffset + 26), extraLength = apk.readUInt16LE(manifestOffset + 28);
const dataStart = manifestOffset + 30 + nameLength + extraLength;
const compressedManifest = apk.subarray(dataStart, dataStart + manifestCompressed);
const manifest = manifestMethod === 0 ? compressedManifest : manifestMethod === 8 ? (await import("node:zlib")).inflateRawSync(compressedManifest) : null;
if (!manifest || manifest.length !== manifestSize) throw new Error("APK manifest could not be read.");
function stringPool(chunk) {
  const count = u32(chunk, 8), flags = u32(chunk, 16), stringsStart = u32(chunk, 20), utf8 = (flags & 0x100) !== 0;
  const readLength = (buffer, offset, wide) => {
    if (wide) { const value = buffer.readUInt16LE(offset); return value & 0x8000 ? { length: ((value & 0x7fff) << 16) | buffer.readUInt16LE(offset + 2), next: offset + 4 } : { length: value, next: offset + 2 }; }
    const value = buffer[offset]; return value & 0x80 ? { length: ((value & 0x7f) << 8) | buffer[offset + 1], next: offset + 2 } : { length: value, next: offset + 1 };
  };
  return Array.from({ length: count }, (_, index) => {
    const start = u32(chunk, chunk.readUInt16LE(2) + index * 4);
    let offset = stringsStart + start;
    const charCount = readLength(chunk, offset, !utf8); offset = charCount.next;
    if (utf8) {
      const byteCount = readLength(chunk, offset, false); offset = byteCount.next;
      return chunk.toString("utf8", offset, offset + byteCount.length);
    }
    return chunk.toString("utf16le", offset, offset + charCount.length * 2);
  });
}
let strings = [];
let packageName = null;
let manifestCursor = 8;
while (manifestCursor + 8 <= manifest.length) {
  const type = manifest.readUInt16LE(manifestCursor), headerSize = manifest.readUInt16LE(manifestCursor + 2), size = u32(manifest, manifestCursor + 4);
  if (size < headerSize || manifestCursor + size > manifest.length) throw new Error("APK manifest chunk is malformed.");
  if (type === 0x0001) strings = stringPool(manifest.subarray(manifestCursor, manifestCursor + size));
  if (type === 0x0102 && strings.length) {
    const elementName = strings[u32(manifest, manifestCursor + 20)];
    if (elementName === "manifest") {
      const attributeStart = manifest.readUInt16LE(manifestCursor + 24), attributeSize = manifest.readUInt16LE(manifestCursor + 26), attributeCount = manifest.readUInt16LE(manifestCursor + 28);
      const firstAttribute = manifestCursor + 16 + attributeStart;
      for (let index = 0; index < attributeCount; index++) {
        const attribute = firstAttribute + index * attributeSize;
        const name = strings[u32(manifest, attribute + 4)];
        const rawIndex = u32(manifest, attribute + 8), dataType = manifest[attribute + 15], data = u32(manifest, attribute + 16);
        const value = rawIndex !== 0xffffffff ? strings[rawIndex] : dataType === 0x03 ? strings[data] : String(data);
        if (name === "package") packageName = value;
      }
      break;
    }
  }
  manifestCursor += size;
}
if (!packageName) throw new Error("APK application ID could not be read from its manifest.");
if (packageName !== "com.hellogiftgrid.app") throw new Error(`Unexpected APK application ID: ${packageName}`);
console.log(JSON.stringify({ bytes: apk.length, packageName, signatureScheme: "v2", signatureVerified: true, contentVerified: true, signerSha256: createHash("sha256").update(certificate.raw).digest("hex").toUpperCase() }));
