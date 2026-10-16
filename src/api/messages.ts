import { api } from ".";

type Message = {
  senderId: string;
  content: string;
  recipientId: string;
};

export async function postMessage(message: Message) {
  const { data } = await api.post("/message", message);
  return data;
}
