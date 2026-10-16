import { api } from "@/api";

export type CemeteryPet = {
  id: number;
  name: string;
  dead_at: string;
};

export async function getCemetery(): Promise<CemeteryPet[]> {
  const { data } = await api.get<CemeteryPet[]>("/cemetery");
  return data;
}
