export function SubjectTag({
  children,
  tone = "pink",
}: {
  children: React.ReactNode;
  tone?: "pink" | "mint" | "blue" | "peach";
}) {
  const bg = {
    pink: "bg-primary",
    mint: "bg-secondary",
    blue: "bg-accent",
    peach: "bg-[color:var(--peach)]",
  }[tone];
  return (
    <span
      className={`${bg} text-foreground inline-flex items-center gap-1 rounded-full border border-foreground/15 px-3 py-1 text-xs font-medium`}
    >
      {children}
    </span>
  );
}
