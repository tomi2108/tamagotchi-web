import {
  Apple,
  Backpack,
  Banana,
  Bell,
  Cake,
  Candy,
  Carrot,
  Cat,
  ChefHat,
  Cherry,
  Citrus,
  Clover,
  Cookie,
  Crown,
  Drama,
  Feather,
  Fish,
  FlaskConical,
  Glasses,
  HardHat,
  Heart,
  Package,
  Pill,
  Ribbon,
  Salad,
  Sandwich,
  Shield,
  Shirt,
  Snowflake,
  Sparkles,
  Sprout,
  Sun,
  Tablets,
  Triangle,
  Umbrella,
  Utensils,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type ItemVisual = {
  icon: LucideIcon;
  tone: string;
};

// Palette: forest green, sage, cream, terracotta and warm brown.
// Seeds reuse the icon of their corresponding harvested crop.
const visuals: Record<string, ItemVisual> = {
  // Consumables
  strawberry: {
    icon: Cherry,
    tone: "text-rose-700 dark:text-rose-300",
  },
  apple: {
    icon: Apple,
    tone: "text-primary",
  },
  banana: {
    icon: Banana,
    tone: "text-amber-700 dark:text-amber-300",
  },
  cookie: {
    icon: Cookie,
    tone: "text-amber-800 dark:text-amber-300",
  },
  carrot: {
    icon: Carrot,
    tone: "text-orange-700 dark:text-orange-300",
  },
  fish: {
    icon: Fish,
    tone: "text-teal-700 dark:text-teal-300",
  },
  cake: {
    icon: Cake,
    tone: "text-pink-700 dark:text-pink-300",
  },
  candy: {
    icon: Candy,
    tone: "text-rose-700 dark:text-rose-300",
  },
  sandwich: {
    icon: Sandwich,
    tone: "text-amber-800 dark:text-amber-300",
  },
  energy_potion: {
    icon: Zap,
    tone: "text-amber-700 dark:text-amber-300",
  },
  healing_potion: {
    icon: Heart,
    tone: "text-rose-700 dark:text-rose-300",
  },
  medicine: {
    icon: Pill,
    tone: "text-teal-700 dark:text-teal-300",
  },
  vitamin: {
    icon: Tablets,
    tone: "text-orange-700 dark:text-orange-300",
  },
  syrup: {
    icon: FlaskConical,
    tone: "text-violet-700 dark:text-violet-300",
  },

  // Harvested crops
  tomato: {
    icon: Apple,
    tone: "text-rose-700 dark:text-rose-300",
  },
  lettuce: {
    icon: Salad,
    tone: "text-green-800 dark:text-green-300",
  },
  pumpkin: {
    icon: Citrus,
    tone: "text-orange-700 dark:text-orange-300",
  },

  // Head
  straw_hat: {
    icon: Sun,
    tone: "text-amber-800 dark:text-amber-300",
  },
  crown: {
    icon: Crown,
    tone: "text-amber-700 dark:text-amber-300",
  },
  wool_hat: {
    icon: Snowflake,
    tone: "text-sky-700 dark:text-sky-300",
  },
  cap: {
    icon: HardHat,
    tone: "text-teal-700 dark:text-teal-300",
  },
  wizard_hood: {
    icon: Sparkles,
    tone: "text-violet-700 dark:text-violet-300",
  },
  cat_ears: {
    icon: Cat,
    tone: "text-orange-700 dark:text-orange-300",
  },

  // Body
  blue_shirt: {
    icon: Shirt,
    tone: "text-sky-800 dark:text-sky-300",
  },
  yellow_raincoat: {
    icon: Umbrella,
    tone: "text-amber-700 dark:text-amber-300",
  },
  cozy_sweater: {
    icon: Shirt,
    tone: "text-primary",
  },
  frog_costume: {
    icon: Drama,
    tone: "text-green-800 dark:text-green-300",
  },
  armor: {
    icon: Shield,
    tone: "text-stone-600 dark:text-stone-300",
  },
  apron: {
    icon: ChefHat,
    tone: "text-stone-600 dark:text-stone-300",
  },

  // Accessories
  bell_collar: {
    icon: Bell,
    tone: "text-amber-700 dark:text-amber-300",
  },
  lucky_charm: {
    icon: Clover,
    tone: "text-primary",
  },
  red_bow: {
    icon: Ribbon,
    tone: "text-rose-700 dark:text-rose-300",
  },
  glasses: {
    icon: Glasses,
    tone: "text-stone-700 dark:text-stone-300",
  },
  scarf: {
    icon: Wind,
    tone: "text-rose-700 dark:text-rose-300",
  },
  backpack: {
    icon: Backpack,
    tone: "text-teal-800 dark:text-teal-300",
  },
  fairy_wings: {
    icon: Feather,
    tone: "text-pink-700 dark:text-pink-300",
  },
  bandana: {
    icon: Triangle,
    tone: "text-rose-700 dark:text-rose-300",
  },
};

const fallbackIcons: Record<string, LucideIcon> = {
  consumable: Utensils,
  seed: Sprout,
  equippable: Shirt,
};

export function getItemVisual(item: {
  code?: string;
  type?: string;
}): ItemVisual {
  const code = item.code?.replace(/_seed$/, "");
  const known = code ? visuals[code] : undefined;

  if (known) return known;

  return {
    icon: fallbackIcons[item.type ?? ""] ?? Package,
    tone: "text-muted-foreground",
  };
}

export const rarityOrder = ["common", "uncommon", "rare", "legendary"] as const;

export const rarityConfig: Record<
  string,
  { label: string; color: string; level: number; tile: string }
> = {
  common: {
    label: "Común",
    color: "bg-muted-foreground",
    level: 1,
    tile: "border-border bg-muted/40",
  },
  uncommon: {
    label: "Poco común",
    color: "bg-green-700 dark:bg-green-400",
    level: 2,
    tile: "border-green-700/30 bg-green-700/5 dark:border-green-400/30 dark:bg-green-400/10",
  },
  rare: {
    label: "Raro",
    color: "bg-teal-700 dark:bg-teal-400",
    level: 3,
    tile: "border-teal-700/30 bg-teal-700/5 dark:border-teal-400/30 dark:bg-teal-400/10",
  },
  legendary: {
    label: "Legendario",
    color: "bg-amber-600 dark:bg-amber-300",
    level: 4,
    tile: "border-amber-600/40 bg-gradient-to-br from-amber-600/15 to-amber-600/5 dark:border-amber-300/40 dark:from-amber-300/20 dark:to-amber-300/5",
  },
};
