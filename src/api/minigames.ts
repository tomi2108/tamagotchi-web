import { api } from "@/api";

export type Minigame = {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
};

export type MinigameScore = {
  gameCode: string;
  playerId: number;
  score: number;
};

export type LeaderboardEntry = {
  player_id: number;
  player_name: string;
  score: number;
  createdAt: string;
};

export async function getMinigames(): Promise<Minigame[]> {
  const { data } = await api.get<Minigame[]>("/minigames");
  return data;
}
type RegisterMinigameScoreResponse = {
  coins: number;
};

export async function registerMinigameScore(
  score: MinigameScore,
): Promise<RegisterMinigameScoreResponse> {
  const { data } = await api.post<RegisterMinigameScoreResponse>("/minigames/scores", score);
  return data;
}

export async function getMinigameLeaderboard(gameCode: string): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>(
    `/minigames/${encodeURIComponent(gameCode)}/leaderboard`,
  );
  return data;
}
