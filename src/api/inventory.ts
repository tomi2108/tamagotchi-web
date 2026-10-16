import { api } from ".";

export type EquipmentSlot = "head" | "body" | "accessory";
export type ItemType = "consumable" | "seed" | "equippable";

export type Item = {
  code: string;
  id: number;
  name: string;
  type: ItemType;
  slot: EquipmentSlot | null;
  quantity: number;
};

export const getInventory = async () => {
  const { data } = await api.get<Item[]>("/inventory");
  return data;
};

export const addInventoryItem = async (itemId: number, quantity = 1) => {
  const { data } = await api.post("/inventory", { itemId, quantity });
  return data;
};
