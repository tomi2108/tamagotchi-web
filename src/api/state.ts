import { api } from "./index";

export type PetState = {
  name: string;
  energy: number;
  hunger: number;
  hydration: number;
  cleanliness: number;
  happiness: number;
  is_dead: boolean;
  status: "idle" | "sleeping";
  created_at: string;
  hunger_zero_since: string | null;
  hydration_zero_since: string | null;
  equipment: {
    head: number | null;
    body: number | null;
    accessory: number | null;
  };
};

export async function getPetState(): Promise<PetState | null> {
  const { data } = await api.get<{ pet: PetState | null }>("/state");
  return data.pet ?? null;
}

export async function adoptPet(name: string) {
  const { data } = await api.post("/adopt", { name });
  return data;
}
