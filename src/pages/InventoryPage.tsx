import { useCallback, useEffect, useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import { getInventory, type Item } from "@/api/inventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const typeLabels: Record<string, string> = {
  food: "Comida",
  medicine: "Medicina",
  equippable: "Equipamiento",
};

export default function InventoryPage() {
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
              Visitá la tienda para conseguir comida, medicinas y accesorios para tu mascota.
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
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    {typeLabels[item.type] ?? item.type}
                  </span>
                  <span className="font-medium tabular-nums">×{item.quantity}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
