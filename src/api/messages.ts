import { api } from ".";

type Message = {
  senderId: number;
  content: string;
  recipientId: number;
};

export async function postMessage(message: Message) {
  const { data } = await api.post("/message", message);
  return data;
}
