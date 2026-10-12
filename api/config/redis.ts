import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const DEVICE_STATUS_KEY = 'esp32:status';

export type Device = {
  name: string;
  online: boolean;
};

export async function setDeviceStatus(device: Device) {
  await redis.hset(DEVICE_STATUS_KEY, {
    [device.name]: JSON.stringify(device),
  });
}

export async function getDeviceStatuses(): Promise<Device[]> {
  const devices = await redis.hvals(DEVICE_STATUS_KEY) as any[];
  return devices.map((device) => JSON.parse(device) as Device);
}
