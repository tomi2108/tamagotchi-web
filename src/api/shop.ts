import { api } from ".";
import type { Item } from "./inventory";

export type ItemRarity = "common" | "uncommon" | "rare" | "legendary";
export type ShopItem = Item & {
  price: number;
  rarity: ItemRarity;
  stock: number;
};
export type ShopData = {
  startsAt: string;
  endsAt: string;
  items: ShopItem[];
};

export const getShop = async (): Promise<ShopData> => {
  const { data } = await api.get<ShopData>("/shop");
  return data;
};

export const buyItem = async (itemId: number) => {
  const { data } = await api.post("/shop", { itemId });
  return data;
};
