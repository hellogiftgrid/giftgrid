import { Capacitor } from "@capacitor/core";
import { Camera, type MediaResult } from "@capacitor/camera";
import { Geolocation, type Position } from "@capacitor/geolocation";
import { BleClient, type BleDevice, type RequestBleDeviceOptions } from "@capacitor-community/bluetooth-le";

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

export async function takeGiftPhoto(): Promise<MediaResult> {
  if (!isNativeApp()) throw new Error("Camera access is available in the mobile app.");
  return Camera.takePhoto({ quality: 85, correctOrientation: true });
}

export async function getGiftGridLocation(): Promise<Position> {
  if (!isNativeApp()) throw new Error("GPS access is available in the mobile app.");
  await Geolocation.requestPermissions({ permissions: ["location"] });
  return Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
}

export async function findBluetoothDevice(options?: RequestBleDeviceOptions): Promise<BleDevice> {
  if (!isNativeApp()) throw new Error("Bluetooth access is available in the mobile app.");
  await BleClient.initialize();
  return BleClient.requestDevice(options);
}
