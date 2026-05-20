export function BadgeChip({ name, hint }: { name: string; hint?: string }) {
  return (
    <span
      title={hint}
      className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1 text-xs font-medium"
    >
      <span aria-hidden>★</span>
      {name}
    </span>
  );
}
