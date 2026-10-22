import { api } from "./index";

export type PetState = {
  id: number;
  name: string;
  energy: number;
  hunger: number;
  species: "cat" | "dog" | "rabbit";
  hydration: number;
  cleanliness: number;
  happiness: number;
  is_dead: boolean;
  dead_at: string | null;
  status: "idle" | "sleeping";
  hunger_zero_since: string | null;
  hydration_zero_since: string | null;
  equipment: {
    head: unknown | null;
    body: unknown | null;
    accessory: unknown | null;
  };
};

export type DeadPet = Pick<PetState, "name" | "dead_at"> & {
  died_at: string;
};

export async function getPetState(): Promise<PetState | null> {
  const { data } = await api.get<{ pet: PetState | null }>("/state");
  return data.pet;
}

export async function adoptPet(name: string, species: PetState["species"]) {
  const { data } = await api.post("/adopt", { name, species });
  return data;
}
