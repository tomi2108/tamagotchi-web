import { api } from ".";

export type Minigame = {
  id: number;
  code: string;
  name: string;
  description: string;
};

export const getMinigames = async (): Promise<Minigame[]> => {
  const { data } = await api.get<Minigame[]>("/minigames");
  return data;
};
