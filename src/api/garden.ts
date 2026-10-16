import { api } from ".";

export type GardenPlot = {
  plot_number: number;
  seed_code: string | null;
  seed_name: string | null;
  planted_at: string | null;
  ready_at: string | null;
  ready: boolean;
};

export type GardenHarvest = {
  plotNumber: number;
  itemId: number;
  quantity: number;
};

export const getGarden = async () => {
  const { data } = await api.get<GardenPlot[]>("/garden");
  return data;
};

export const plantSeed = async (plotNumber: number, seedCode: string) => {
  const { data } = await api.post<GardenPlot>("/garden/plant", {
    plotNumber,
    seedCode,
  });
  return data;
};

export const harvestPlant = async (plotNumber: number) => {
  const { data } = await api.post<GardenHarvest>("/garden/harvest", {
    plotNumber,
  });
  return data;
};
