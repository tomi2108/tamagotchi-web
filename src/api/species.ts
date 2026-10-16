import { api } from "@/api";

export type PetSpecies = {
  id: "cat" | "dog" | "rabbit";
  name: string;
  description: string;
};

export async function getSpecies(): Promise<PetSpecies[]> {
  const { data } = await api.get<{ species: PetSpecies[] }>("/species");
  return data.species;
}
