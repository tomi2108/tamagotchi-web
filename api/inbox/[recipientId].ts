import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "./config/sql";

export async function getInbox(recipientId: string) {
  const result = await sql.query(
    `SELECT * from messages 
     WHERE recipient_id = $1`,
    [recipientId],
  );
  return result.rows;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const { recipientId } = req.query;
  if (typeof recipientId !== "string") return res.status(400).end();
  try {
    const inbox = await getInbox(recipientId);
    return res.status(200).json(inbox);
  } catch (err) {
    console.error(err);
    return res.status(500).end();
  }
}
