export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span>{t}</span>
            <span aria-hidden>✺</span>
          </span>
        ))}
      </div>
    </div>
  );
}
