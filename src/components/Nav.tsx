import { Link } from "@tanstack/react-router";
import { PillLink } from "./PillButton";

const links = [
  { to: "/", label: "Home" },
  { to: "/tutors", label: "Tutors" },
  { to: "/sessions", label: "Sessions" },
  { to: "/reputation", label: "Reputation" },
] as const;

export function Nav() {
  return (
    <header className="sticky top-3 z-30 mx-3 mt-3 rounded-full border border-foreground/20 bg-background/85 px-4 py-2 backdrop-blur md:mx-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span aria-hidden className="text-xl">🎓</span>
          <span className="font-display text-2xl leading-none">peerly.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-foreground/80 hover:text-foreground"
              activeProps={{ className: "font-semibold text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <PillLink to="/tutors" className="!px-4 !py-1.5 !text-xs">
          Find a tutor
        </PillLink>
      </div>
    </header>
  );
}
