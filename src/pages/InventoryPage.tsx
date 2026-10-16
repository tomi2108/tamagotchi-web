import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Apple,
  Backpack,
  Bandage,
  Bone,
  Carrot,
  Cherry,
  Clock,
  Coins,
  Flower2,
  Gem,
  Gift,
  Heart,
  Leaf,
  Package,
  Pill,
  RefreshCw,
  Shield,
  Shirt,
  Sparkles,
  Sprout,
  Star,
  Sword,
  Utensils,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { getInventory, type Item } from "@/api/inventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const typeLabels: Record<Item["type"], string> = {
  consumable: "Consumible",
  seed: "Semilla",
  equippable: "Equipamiento",
};

function getItemIcon(item: Item): LucideIcon {
  const value = `${item.code} ${item.name}`.toLowerCase();

  if (item.type === "seed") {
    if (value.includes("strawberry") || value.includes("frutilla")) {
      return Cherry;
    }

    if (value.includes("carrot") || value.includes("zanahoria")) {
      return Carrot;
    }

    if (value.includes("flower") || value.includes("flor")) {
      return Flower2;
    }

    if (value.includes("wheat") || value.includes("trigo")) {
      return Wheat;
    }

    if (value.includes("pumpkin") || value.includes("calabaza")) {
      return Apple;
    }

    return Sprout;
  }

  if (item.type === "consumable") {
    if (value.includes("medicine") || value.includes("medicina") || value.includes("pill")) {
      return Pill;
    }

    if (value.includes("bandage") || value.includes("venda")) {
      return Bandage;
    }

    if (value.includes("heart") || value.includes("corazon")) {
      return Heart;
    }

    if (value.includes("bone") || value.includes("hueso")) {
      return Bone;
    }

    if (
      value.includes("food") ||
      value.includes("comida") ||
      value.includes("fruit") ||
      value.includes("fruta")
    ) {
      return Apple;
    }

    if (value.includes("carrot") || value.includes("zanahoria")) {
      return Carrot;
    }

    if (value.includes("water") || value.includes("agua")) {
      return Utensils;
    }

    return Gift;
  }

  if (value.includes("armor") || value.includes("armadura") || value.includes("shield")) {
    return Shield;
  }

  if (value.includes("sword") || value.includes("espada")) {
    return Sword;
  }

  if (
    value.includes("shirt") ||
    value.includes("camisa") ||
    value.includes("clothes") ||
    value.includes("ropa")
  ) {
    return Shirt;
  }

  if (value.includes("gem") || value.includes("gema")) {
    return Gem;
  }

  if (value.includes("coin") || value.includes("moneda")) {
    return Coins;
  }

  if (value.includes("star") || value.includes("estrella")) {
    return Star;
  }

  if (value.includes("clock") || value.includes("reloj")) {
    return Clock;
  }

  if (value.includes("backpack") || value.includes("mochila")) {
    return Backpack;
  }

  if (value.includes("leaf") || value.includes("hoja")) {
    return Leaf;
  }

  if (value.includes("magic") || value.includes("magico")) {
    return Sparkles;
  }

  return Package;
}

export default function InventoryPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setItems(await getInventory());
    } catch {
      setError("No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  if (loading) {
    return <p className="text-muted-foreground">Cargando inventario...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="mt-1 text-muted-foreground">Los objetos que juntaste para tu mascota.</p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => void loadInventory()}
          aria-label="Actualizar inventario"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {error && (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void loadInventory()}>
            Reintentar
          </Button>
        </div>
      )}

      {!error && items.length === 0 && (
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <Package className="size-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Tu inventario está vacío</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Visitá la tienda para conseguir consumibles, semillas y equipamiento para tu mascota.
            </p>
          </CardContent>
        </Card>
      )}

      {!error && items.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "artículo" : "artículos"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const ItemIcon = getItemIcon(item);

              return (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <ItemIcon className="size-6 text-primary" strokeWidth={1.75} />
                      </div>

                      <CardTitle className="text-base">{item.name}</CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">{typeLabels[item.type]}</span>

                      <span className="font-medium tabular-nums">×{item.quantity}</span>
                    </div>

                    {item.type === "seed" && (
                      <Button className="w-full" onClick={() => navigate("/garden")}>
                        <Sprout className="size-4" />
                        Ir a la huerta
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
