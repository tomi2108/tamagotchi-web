import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDeviceStatuses, setDeviceStatus, } from './config/redis';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method === 'GET') {
    const devices = await getDeviceStatuses();

    return res.status(200).json(devices);
  }

  if (req.method === 'POST') {
    const { name, online } = req.body;

    if (typeof name !== 'string' || typeof online !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid status',
      });
    }

    await setDeviceStatus({
      name,
      online,
    });

    return res.status(200).json({
      ok: true,
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);

  return res.status(405).json({
    error: 'Method not allowed',
  });
}
