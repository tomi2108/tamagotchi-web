import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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

const primaryLinks = links.slice(0, 4);

const speciesIcons = {
  cat: Cat,
  dog: Dog,
  rabbit: Rabbit,
} as const;

export default function AppToolbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pet, loading } = usePet();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

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
      {links.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`
          }
        >
          <Icon size={20} strokeWidth={1.75} />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile floating navigation */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 flex items-stretch justify-around rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-lg shadow-black/10 backdrop-blur-xl md:hidden"
      >
        {primaryLinks.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setMenuOpen(false)}
            aria-label={label}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={21} strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="text-[10px] font-medium leading-none">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir todas las opciones"
          aria-expanded={menuOpen}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors ${
            menuOpen
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Menu size={21} strokeWidth={1.75} />
          <span className="text-[10px] font-medium leading-none">Más</span>
        </button>
      </nav>

      {/* Full-screen mobile menu */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="fixed inset-0 z-50 overflow-y-auto bg-background md:hidden"
        >
          <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-[calc(env(safe-area-inset-top)+1rem)]">
            <header className="mb-6 flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="font-pixel text-sm text-primary"
              >
                Mimitos
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X size={22} />
              </button>
            </header>

            <section className="mb-6">{companion}</section>

            <div className="mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Todas las opciones
              </h2>
            </div>

            <nav className="flex flex-col gap-1">{navLinks}</nav>

            <div className="mt-auto pt-8">
              <p className="text-center text-xs text-muted-foreground">
                Mimitos · Tu compañero virtual
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
        <Link
          to="/"
          className="mb-8 px-3 py-2 font-pixel text-sm leading-relaxed text-primary"
        >
          Mimitos
        </Link>

        <nav className="flex flex-1 flex-col gap-2">{navLinks}</nav>

        <div className="mt-auto border-t border-border pt-4">{companion}</div>
      </aside>
    </>
  );
}
