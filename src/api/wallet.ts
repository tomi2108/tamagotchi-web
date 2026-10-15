import { api } from "./index";

export type Wallet = {
  coins: number;
};

export async function getWallet() {
  const { data } = await api.get<Wallet>("/wallet");
  return data;
}
