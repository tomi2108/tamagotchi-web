import { api } from ".";

export type Player = {
  id: number;
  name: string;
};

export const getPlayers = async (): Promise<Player[]> => {
  const { data } = await api.get<Player[]>("/players");
  return data;
};
