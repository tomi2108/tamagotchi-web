import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ClipboardList,
  Flower2,
  Gamepad2,
  Heart,
  Menu,
  MessageCircle,
  Package,
  ShoppingBag,
  Sprout,
  UserRound,
  X,
} from "lucide-react";
import { usePlayer } from "./PlayerContext";

const links = [
  { label: "Mascota", to: "/", icon: Heart },
  { label: "Inventario", to: "/inventory", icon: Package },
  { label: "Tienda", to: "/shop", icon: ShoppingBag },
  { label: "Cementerio", to: "/cemetery", icon: Flower2 },
  { label: "Huerta", to: "/garden", icon: Sprout },
  { label: "Misiones diarias", to: "/missions", icon: ClipboardList },
  { label: "Juegos", to: "/games", icon: Gamepad2 },
  { label: "Mensajes", to: "/messages", icon: MessageCircle },
];

export default function AppToolbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { player } = usePlayer();

  const navLinks = (
    <>
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

      <div className="my-2 border-t border-border" />

      <NavLink
        to="/caregiver"
        onClick={() => setMenuOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg border px-3 py-3 transition-colors ${isActive
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`
        }
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <UserRound size={19} className="text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Cuidador</p>
          <p className="truncate text-sm font-semibold text-foreground">
            {player?.name ?? "Mi perfil"}
          </p>
        </div>
      </NavLink>
    </>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <Link to="/" className="font-pixel text-sm text-primary">
          Tamagotchi
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
        <div className="flex flex-col gap-2">{navLinks}</div>
      </nav>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
        <Link to="/" className="mb-8 px-3 py-2 font-pixel text-sm leading-relaxed text-primary">
          Tamagotchi
        </Link>

        <nav className="flex flex-col gap-2">{navLinks}</nav>
      </aside>
    </>
  );
}
