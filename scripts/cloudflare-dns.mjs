const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;
if (!token || !zoneId) throw new Error("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required");

const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
const base = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
const target = process.env.VERCEL_CNAME_TARGET || "cname.vercel-dns.com";

for (const name of ["community.degiftgrid.com", "console.degiftgrid.com"]) {
  const query = await fetch(`${base}?type=CNAME&name=${encodeURIComponent(name)}`, { headers });
  const listed = await query.json();
  if (!listed.success) throw new Error(`Cloudflare lookup failed for ${name}: ${JSON.stringify(listed.errors || [])}`);
  const record = listed.result?.[0];
  const body = { type: "CNAME", name, content: target, ttl: 1, proxied: false };
  const response = await fetch(record ? `${base}/${record.id}` : base, {
    method: record ? "PUT" : "POST", headers, body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!result.success) throw new Error(`Cloudflare DNS update failed for ${name}: ${JSON.stringify(result.errors)}`);
  console.log(`${record ? "updated" : "created"} ${name} -> ${target}`);
}
