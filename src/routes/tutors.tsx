import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getActiveTutors } from "@/data/queries";
import { TutorCard } from "@/components/TutorCard";

export const Route = createFileRoute("/tutors")({
  head: () => ({
    meta: [
      { title: "Browse tutors — peerly." },
      { name: "description", content: "Search every active teaching offer by subject, rate, and rating." },
    ],
  }),
  component: TutorsPage,
});

function TutorsPage() {
  const all = getActiveTutors();
  const [q, setQ] = useState("");
  const [rate, setRate] = useState<"all" | "Free" | "Paid">("all");

  const filtered = useMemo(() => {
    return all.filter((t) => {
      const matchesQ =
        q === "" ||
        t.subject_name.toLowerCase().includes(q.toLowerCase()) ||
        t.student_name.toLowerCase().includes(q.toLowerCase()) ||
        t.category.toLowerCase().includes(q.toLowerCase());
      const matchesRate = rate === "all" || t.rate === rate;
      return matchesQ && matchesRate;
    });
  }, [all, q, rate]);

  return (
    <section className="mx-3 mt-6 md:mx-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Browse</p>
          <h1 className="font-display text-5xl">every tutor on peerly.</h1>
        </header>

        <div className="mb-6 flex flex-wrap gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subject, tutor, category…"
            className="flex-1 min-w-[200px] rounded-full border border-foreground/30 bg-background px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-1 rounded-full border border-foreground/30 bg-background p-1">
            {(["all", "Free", "Paid"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`rounded-full px-4 py-1.5 text-xs ${rate === r ? "bg-foreground text-background" : "text-foreground/70"}`}
              >
                {r === "all" ? "All" : r}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-4 text-xs text-muted-foreground">{filtered.length} tutors</p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <TutorCard key={t.offer_id} tutor={t} index={i} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">
              No tutors match your filters yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
