import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMqttClient } from "./mqtt.js";
import { sql } from "./sql";

type Message = {
  message: string;
  topic: string;
};

function encodeMessage(message: string) {
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);

  const buffer = new Uint8Array(4 + messageBytes.length);

  const view = new DataView(buffer.buffer);

  view.setUint32(0, messageBytes.length, true);
  buffer.set(messageBytes, 4);

  return Buffer.from(buffer);
}

export async function sendMessage(senderId: string, recipientId: string, content: string) {
  const result = await sql.query(
    `INSERT INTO messages (sender_id, recipient_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [senderId, recipientId, content],
  );
  return result.rows[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { senderId, topic, message } = JSON.parse(req.body) as Message;
    const client = await getMqttClient();
    await sendMessage(senderId, topic, message);
    client.publish(topic, encodeMessage(message));
    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
}
