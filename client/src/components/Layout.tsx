import { NavLink, Outlet } from "react-router-dom";
import {
  PenLine,
  GitBranch,
  Play,
  Package,
  House,
  BookOpen,
  LayoutTemplate,
  BarChart3,
} from "lucide-react";
import Logo from "./Logo";
import GithubIcon from "./GithubIcon";
import { GITHUB_REPO_URL } from "../config/site";

const mainLinks = [
  { to: "/", label: "Home", step: null, icon: House, end: true },
  { to: "/create", label: "Describe", step: "01", icon: PenLine },
  { to: "/editor", label: "Design", step: "02", icon: GitBranch },
  { to: "/simulate", label: "Run", step: "03", icon: Play },
  { to: "/export", label: "Ship", step: "04", icon: Package },
];

const exploreLinks = [
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/source", label: "Source", icon: BookOpen },
];

const mobileLinks = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/editor", label: "Design", icon: GitBranch },
  { to: "/simulate", label: "Run", icon: Play },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
];

function NavItem({
  to,
  label,
  step,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  step?: string | null;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
          isActive
            ? "bg-brand-600/15 text-brand-300 border border-brand-500/25"
            : "text-cream-muted hover:text-cream hover:bg-surface-2 border border-transparent"
        }`
      }
    >
      {step && <span className="font-mono text-[10px] text-cream-dim w-4 shrink-0">{step}</span>}
      {!step && <span className="w-4 shrink-0" />}
      <Icon className="w-4 h-4 shrink-0" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  return (
    <div className="wf-grain min-h-screen flex">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-surface z-10">
        <div className="px-5 py-6 flex items-center gap-2.5">
          <Logo />
          <span className="font-display font-bold text-cream text-lg tracking-tight">wayflow</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {mainLinks.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}

          <div className="pt-4 pb-2">
            <span className="px-3 font-mono text-[10px] uppercase tracking-widest text-cream-dim">
              Explore
            </span>
          </div>
          {exploreLinks.map(({ to, label, icon }) => (
            <NavItem key={to} to={to} label={label} icon={icon} />
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-border space-y-3">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-cream-muted hover:text-brand-400 transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            GitHub
          </a>
          <p className="text-[11px] text-cream-dim leading-relaxed">
            Map processes.<br />Run them. Ship them.
          </p>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-surface/95 backdrop-blur flex justify-around py-2 px-1">
        {mobileLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition-colors ${
                isActive ? "text-brand-400" : "text-cream-dim"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <main className="flex-1 pb-20 md:pb-0 wf-dot-grid">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
