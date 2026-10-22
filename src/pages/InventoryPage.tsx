import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Package,
  PackageOpen,
  RefreshCw,
  Search,
  Shirt,
  ShoppingBag,
  Sprout,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { getInventory, type Item } from "@/api/inventory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getItemVisual, rarityConfig, rarityOrder } from "@/lib/item-icons";
import { cn } from "@/lib/utils";

// Rarity comes from the items catalog. If your API doesn't return it yet,
// the rarity filter is hidden and every item is treated as common.
type InventoryItem = Item & { rarity?: string };

type TypeFilter = "all" | Item["type"];

const typeFilters: { value: TypeFilter; label: string; icon: LucideIcon }[] = [
  { value: "all", label: "Todo", icon: LayoutGrid },
  { value: "consumable", label: "Consumibles", icon: Utensils },
  { value: "seed", label: "Semillas", icon: Sprout },
  { value: "equippable", label: "Equipamiento", icon: Shirt },
];

// Lowercase and strip accents so "pocion" finds "Poción".
function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function ItemTile({
  item,
  onOpenGarden,
}: {
  item: InventoryItem;
  onOpenGarden: () => void;
}) {
  const { icon: Icon, tone } = getItemVisual(item);
  const rarity = rarityConfig[item.rarity ?? "common"] ?? rarityConfig.common;
  const isSeed = item.type === "seed";

  const tileClass = cn(
    "relative flex aspect-square w-full items-center justify-center rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
    rarity.tile,
    isSeed &&
      "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );

  const content = (
    <>
      <Icon
        className={cn("size-9 sm:size-10", tone)}
        strokeWidth={1.6}
        aria-hidden="true"
      />

      {isSeed && (
        <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Sprout className="size-3" aria-hidden="true" />
        </span>
      )}

      <span className="absolute bottom-1.5 right-1.5 rounded-md bg-background/85 px-1.5 text-xs font-semibold tabular-nums shadow-sm">
        ×{item.quantity}
      </span>
    </>
  );

  return (
    <li className="flex min-w-0 flex-col gap-1.5">
      {isSeed ? (
        <button
          type="button"
          className={tileClass}
          title={item.name}
          aria-label={`${item.name}, ${item.quantity} unidades. Ir a la huerta`}
          onClick={onOpenGarden}
        >
          {content}
        </button>
      ) : (
        <div
          className={tileClass}
          title={item.name}
          role="img"
          aria-label={`${item.name}, ${item.quantity} unidades`}
        >
          {content}
        </div>
      )}

      <span className="line-clamp-2 text-center text-xs leading-tight text-muted-foreground">
        {item.name}
      </span>
    </li>
  );
}

export default function InventoryPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [rarities, setRarities] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const loadInventory = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setItems((await getInventory()) as InventoryItem[]);
    } catch {
      setError("No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const counts = useMemo(
    () => ({
      all: items.length,
      consumable: items.filter((item) => item.type === "consumable").length,
      seed: items.filter((item) => item.type === "seed").length,
      equippable: items.filter((item) => item.type === "equippable").length,
    }),
    [items],
  );

  const totalUnits = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const hasRarity = items.some((item) => item.rarity);

  const visibleItems = useMemo(() => {
    const search = normalize(query.trim());

    return items
      .filter((item) => {
        if (typeFilter !== "all" && item.type !== typeFilter) return false;

        if (
          rarities.length > 0 &&
          !rarities.includes(item.rarity ?? "common")
        ) {
          return false;
        }

        return !search || normalize(item.name).includes(search);
      })
      .sort((a, b) => {
        const levelA = rarityConfig[a.rarity ?? "common"]?.level ?? 0;
        const levelB = rarityConfig[b.rarity ?? "common"]?.level ?? 0;

        return levelB - levelA || a.name.localeCompare(b.name, "es");
      });
  }, [items, typeFilter, rarities, query]);

  const hasActiveFilters =
    typeFilter !== "all" || rarities.length > 0 || query.trim() !== "";

  function resetFilters() {
    setTypeFilter("all");
    setRarities([]);
    setQuery("");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>

          {!loading && !error && items.length > 0 && (
            <Badge
              variant="secondary"
              className="gap-1 tabular-nums"
              aria-label={`${totalUnits} unidades en total`}
            >
              <Package className="size-3.5" aria-hidden="true" />
              {totalUnits}
            </Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => void loadInventory(true)}
          disabled={loading || refreshing}
          aria-label="Actualizar inventario"
        >
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
        >
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadInventory()}
          >
            Reintentar
          </Button>
        </div>
      )}

      {loading && (
        <div
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          aria-busy="true"
        >
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse rounded-2xl border bg-muted/40"
            />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
          <PackageOpen className="size-14" aria-hidden="true" />
          <Button variant="outline" onClick={() => navigate("/shop")}>
            <ShoppingBag className="size-4" />
            Tienda
          </Button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar"
                aria-label="Buscar objetos"
                className="pl-8"
              />
            </div>

            {/* Base UI: the value is always an array. Without `multiple`,
                it holds at most one item. */}
            <ToggleGroup
              variant="outline"
              value={[typeFilter]}
              onValueChange={(value) => {
                if (value[0]) setTypeFilter(value[0] as TypeFilter);
              }}
              aria-label="Filtrar por tipo"
            >
              {typeFilters.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  aria-label={label}
                  title={label}
                  className="gap-1.5 px-3"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="text-xs tabular-nums">{counts[value]}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {hasRarity && (
              <ToggleGroup
                multiple
                variant="outline"
                value={rarities}
                onValueChange={(value) => setRarities(value)}
                aria-label="Filtrar por rareza"
              >
                {rarityOrder.map((rarity) => (
                  <ToggleGroupItem
                    key={rarity}
                    value={rarity}
                    aria-label={rarityConfig[rarity].label}
                    title={rarityConfig[rarity].label}
                    className="px-3"
                  >
                    <span
                      className={cn(
                        "size-3 rounded-full",
                        rarityConfig[rarity].color,
                      )}
                    />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          </div>

          {visibleItems.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
              <PackageOpen className="size-12" aria-hidden="true" />
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {visibleItems.map((item) => (
                <ItemTile
                  key={item.id}
                  item={item}
                  onOpenGarden={() => navigate("/garden")}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
