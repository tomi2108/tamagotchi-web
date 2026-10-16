import { api } from "./index";

export type Mission = {
  id: number;
  code: string;
  title: string;
  description: string;
  type: "automatic" | "manual";
  target: number;
  progress: number;
  reward_coins: number;
  completed_at: string | null;
};

export async function getDailyMissions(): Promise<Mission[]> {
  const { data } = await api.get<Mission[]>("/missions");
  return data;
}

export async function completeMission(
  missionId: number,
): Promise<{ success: boolean; coins: number }> {
  const { data } = await api.post<{ success: boolean; coins: number }>("/missions/complete", {
    missionId,
  });

  return data;
}
