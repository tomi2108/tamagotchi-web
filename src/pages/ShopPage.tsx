import { useCallback, useEffect, useState } from "react";
import { Coins, RefreshCw, ShoppingBag } from "lucide-react";
import { buyItem, getShop, type ShopData, type ShopItem } from "@/api/shop";
import { getWallet, type Wallet } from "@/api/wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRemaining } from "@/lib/format";
import { getItemVisual, rarityConfig } from "@/lib/item-icons";
import { cn } from "@/lib/utils";

const slotLabels: Record<string, string> = {
  head: "Cabeza",
  body: "Cuerpo",
  accessory: "Accesorio",
};

export default function ShopPage() {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadShop = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [shopData, walletData] = await Promise.all([
        getShop(),
        getWallet(),
      ]);

      setShop(shopData);
      setWallet(walletData);
    } catch {
      setError("No se pudo cargar la tienda. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShop();
  }, [loadShop]);

  async function handlePurchase(item: ShopItem) {
    if (purchasingId !== null) return;

    const totalPrice = item.price * item.stock;

    if (item.stock <= 0 || !wallet || wallet.coins < totalPrice) {
      setError("No tenés suficientes monedas para comprar este lote.");
      return;
    }

    setPurchasingId(item.id);
    setError(null);
    setNotice(null);

    try {
      await buyItem(item.id);

      const [shopData, walletData] = await Promise.all([
        getShop(),
        getWallet(),
      ]);

      setShop(shopData);
      setWallet(walletData);
      setNotice(`Compraste ${item.stock} unidades de ${item.name}.`);
    } catch {
      setError(
        `No se pudo comprar ${item.name}. Verificá tus monedas e intentá nuevamente.`,
      );
    } finally {
      setPurchasingId(null);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Cargando tienda...</p>;
  }

  if (error && (!shop || !wallet)) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" onClick={() => void loadShop()}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!shop || !wallet) return null;

  const rotationEnd = new Date(shop.endsAt);
  const hasValidRotation = !Number.isNaN(rotationEnd.getTime());
  const rotationRemaining = hasValidRotation
    ? formatRemaining(shop.endsAt, now)
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tienda</h1>
          <p className="mt-1 text-muted-foreground">
            Encontrá algo lindo para tu mascota.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
            <Coins className="size-5 text-yellow-500" />
            <span className="font-semibold tabular-nums">
              {wallet.coins.toLocaleString("es-AR")}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => void loadShop()}
            disabled={purchasingId !== null}
            aria-label="Actualizar tienda"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {rotationRemaining !== null && (
        <p className="text-sm text-muted-foreground">
          La tienda se renueva en {rotationRemaining}.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
      )}

      {shop.items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
            <ShoppingBag className="size-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No hay artículos</h2>
            <p className="text-sm text-muted-foreground">
              Volvé cuando se renueve la tienda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shop.items.map((item) => {
            const outOfStock = item.stock <= 0;
            const totalPrice = item.price * item.stock;
            const canAfford = wallet.coins >= totalPrice;
            const isPurchasing = purchasingId === item.id;

            const { icon: ItemIcon, tone } = getItemVisual(item);
            const rarity = rarityConfig[item.rarity] ?? rarityConfig.common;

            return (
              <Card
                key={item.id}
                className="group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105",
                        rarity.tile,
                      )}
                    >
                      <ItemIcon
                        className={cn("size-6", tone)}
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <CardTitle className="text-base leading-snug">
                        {item.name}
                      </CardTitle>

                      {item.slot && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {slotLabels[item.slot] ?? item.slot}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className="text-xs font-medium tabular-nums text-muted-foreground"
                        aria-label={`${item.stock} unidades disponibles`}
                      >
                        ×{item.stock}
                      </span>

                      <div
                        className="flex items-center gap-1"
                        role="img"
                        aria-label={`Rareza: ${rarity.label}`}
                        title={rarity.label}
                      >
                        {Array.from({ length: 4 }, (_, index) => (
                          <span
                            key={index}
                            className={cn(
                              "size-1.5 rounded-full",
                              index < rarity.level ? rarity.color : "bg-muted",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="mt-auto pt-4">
                  <div className="flex items-center justify-between gap-3 border-t pt-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Coins className="size-4 shrink-0 text-amber-500" />
                        <span className="text-lg font-bold tabular-nums">
                          {totalPrice.toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      disabled={
                        outOfStock || !canAfford || purchasingId !== null
                      }
                      onClick={() => void handlePurchase(item)}
                    >
                      {isPurchasing
                        ? "Comprando..."
                        : outOfStock
                          ? "Agotado"
                          : !canAfford
                            ? "Sin monedas"
                            : "Comprar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
