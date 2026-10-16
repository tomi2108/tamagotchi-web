import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Cat,
  ClipboardList,
  Dog,
  Flower2,
  Gamepad2,
  Heart,
  Menu,
  MessageCircle,
  Package,
  Rabbit,
  ShoppingBag,
  Sprout,
  UserRound,
  X,
} from "lucide-react";
import { usePet } from "./PetContext";

const links = [
  { label: "Mascota", to: "/", icon: Heart },
  { label: "Jugar", to: "/games", icon: Gamepad2 },
  { label: "Jardín", to: "/garden", icon: Sprout },
  { label: "Tienda", to: "/shop", icon: ShoppingBag },
  { label: "Misiones", to: "/missions", icon: ClipboardList },
  { label: "Inventario", to: "/inventory", icon: Package },
  { label: "Cementerio", to: "/cemetery", icon: Flower2 },
  { label: "Mensajes", to: "/messages", icon: MessageCircle },
  { label: "Perfil", to: "/caregiver", icon: UserRound },
];

const speciesIcons = {
  cat: Cat,
  dog: Dog,
  rabbit: Rabbit,
} as const;

export default function AppToolbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pet, loading } = usePet();

  const SpeciesIcon =
    pet?.species && pet.species in speciesIcons
      ? speciesIcons[pet.species as keyof typeof speciesIcons]
      : Heart;

  const companion = (
    <Link
      to="/"
      onClick={() => setMenuOpen(false)}
      className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 transition-colors hover:border-primary/60 hover:bg-primary/10"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <SpeciesIcon className="size-6 text-primary" strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Tu compañero</p>
        <p className="truncate text-sm font-semibold text-foreground">
          {loading ? "Buscando..." : (pet?.name ?? "Sin compañero")}
        </p>
      </div>

      <SpeciesIcon className="size-4 shrink-0 text-primary/60" />
    </Link>
  );

  const navLinks = (
    <>
      <div className="my-2 border-b border-border" />

      {links.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <Link to="/" className="font-pixel text-sm text-primary">
          Mimitos
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-lg hover:bg-accent"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      <nav
        id="mobile-navigation"
        className={`fixed inset-x-0 top-16 z-50 border-b border-border bg-card p-4 shadow-lg transition-all duration-200 md:hidden ${menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
      >
        <div className="flex flex-col gap-2">
          {navLinks}
          <div className="mt-3 border-t border-border pt-3">{companion}</div>
        </div>
      </nav>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
        <Link to="/" className="mb-8 px-3 py-2 font-pixel text-sm leading-relaxed text-primary">
          Mimitos
        </Link>

        <nav className="flex flex-1 flex-col gap-2">{navLinks}</nav>

        <div className="mt-auto border-t border-border pt-4">{companion}</div>
      </aside>
    </>
  );
}
