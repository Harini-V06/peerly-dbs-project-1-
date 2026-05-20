import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

type Variant = "primary" | "outline" | "dark";

const styles: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground border-foreground hover:brightness-95",
  outline: "bg-background text-foreground border-foreground hover:bg-muted",
  dark:    "bg-foreground text-background border-foreground hover:opacity-90",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition shadow-[2px_2px_0_0_var(--foreground)] hover:shadow-[3px_3px_0_0_var(--foreground)]";

export function PillButton({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<"button">) {
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function PillLink({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<typeof Link>) {
  return <Link className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
