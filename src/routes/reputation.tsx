import { createFileRoute } from "@tanstack/react-router";
import { CURRENT_USER_ID } from "@/data/mockDb";
import { getStudentReputation, getRatingsFor } from "@/data/queries";
import { StarRating } from "@/components/StarRating";
import { BadgeChip } from "@/components/BadgeChip";

export const Route = createFileRoute("/reputation")({
  head: () => ({ meta: [{ title: "My reputation — peerly." }] }),
  component: ReputationPage,
});

function ReputationPage() {
  const rep = getStudentReputation(CURRENT_USER_ID);
  const reviews = getRatingsFor(CURRENT_USER_ID);

  const stats = [
    { label: "Reputation score", value: rep.reputation_score.toFixed(2), tone: "pink" },
    { label: "Avg rating", value: rep.avg_rating.toFixed(1), tone: "mint" },
    { label: "Sessions completed", value: rep.completed_sessions, tone: "blue" },
    { label: `Rank in ${rep.student.department}`, value: `#${rep.dept_rank} / ${rep.dept_total}`, tone: "peach" },
  ] as const;

  const toneBg: Record<string, string> = {
    pink: "bg-primary/50",
    mint: "bg-secondary",
    blue: "bg-accent",
    peach: "bg-[color:var(--peach)]",
  };

  return (
    <section className="mx-3 mt-6 md:mx-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Reputation dashboard</p>
        <h1 className="font-display text-5xl">{rep.student.name.split(" ")[0]}'s standing.</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`${toneBg[s.tone]} rounded-3xl border border-foreground/15 p-5 shadow-[2px_2px_0_0_var(--foreground)]`}
            >
              <p className="text-xs uppercase tracking-widest text-foreground/70">{s.label}</p>
              <p className="font-display text-4xl mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-background border border-foreground/15 p-6">
            <h2 className="font-display text-2xl">Badges</h2>
            <p className="text-xs text-muted-foreground mb-3">Auto-awarded by database triggers.</p>
            {rep.badges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No badges yet — keep teaching!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {rep.badges.map((b) => <BadgeChip key={b.badge_name} name={b.badge_name} hint={b.criteria} />)}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-background border border-foreground/15 p-6">
            <h2 className="font-display text-2xl">How your score is computed</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Weighted average of received ratings (recent ratings weighted higher)</li>
              <li>Recomputed automatically by <code>trg_update_reputation</code></li>
              <li>Each change is written to <code>ReputationLog</code> for audit</li>
              <li>10 completed sessions ⇒ Expert badge via <code>trg_award_expert_badge</code></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-background border border-foreground/15 p-6">
          <h2 className="font-display text-2xl mb-3">Recent ratings received</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ratings yet.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.slice().reverse().map((r) => (
                <li key={r.rating_id} className="rounded-2xl border border-foreground/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{r.rater.name}</span>
                    <StarRating value={r.score} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">"{r.comment}"</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
