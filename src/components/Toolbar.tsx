import { Link, NavLink } from "react-router-dom";
import { Heart, Package, ShoppingBag } from "lucide-react";

const links = [
  { label: "Pet", to: "/", icon: Heart },
  { label: "Inventory", to: "/inventory", icon: Package },
  { label: "Shop", to: "/shop", icon: ShoppingBag },
];

export default function AppToolbar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card p-4">
      <Link to="/" className="mb-8 px-3 py-2 font-pixel text-sm leading-relaxed text-primary">
        Mimitos
      </Link>

      <nav className="flex flex-col gap-1">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
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
      </nav>
    </aside>
  );
}
