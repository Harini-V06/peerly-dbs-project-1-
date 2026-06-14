import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import {
  getStudentByIdFn, getStudentReputationFn, getRatingsForFn,
  getTeachingSubjectsFn, getLearningSubjectsFn, getActiveTutorsFn,
} from "@/data/serverQueries";
import { SubjectTag } from "@/components/SubjectTag";
import { BadgeChip } from "@/components/BadgeChip";
import { StarRating } from "@/components/StarRating";
import { PillLink } from "@/components/PillButton";

export const Route = createFileRoute("/students/$id")({
  head: ({ loaderData }) => {
    return {
      meta: [
        { title: loaderData?.rep?.student?.name ? `${loaderData.rep.student.name} — peerly.` : "Student profile" },
        { name: "description", content: loaderData?.rep?.student?.name ? `${loaderData.rep.student.name}'s peer-tutoring profile and reputation.` : "Student profile" },
      ],
    };
  },
  beforeLoad: ({ context }) => {
    if (!(context as any).currentUserId) throw redirect({ to: '/login' })
  },
  loader: async ({ params }) => {
    const id = Number(params.id);
    const student = await getStudentByIdFn({ data: { id } });
    if (!student) throw notFound();
    const [rep, teaches, needs, reviews, allTutors] = await Promise.all([
      getStudentReputationFn({ data: { studentId: id } }),
      getTeachingSubjectsFn({ data: { studentId: id } }),
      getLearningSubjectsFn({ data: { studentId: id } }),
      getRatingsForFn({ data: { studentId: id } }),
      getActiveTutorsFn(),
    ]);
    const myOffers = allTutors.filter((t) => t.student_id === id);
    return { id, rep, teaches, needs, reviews, myOffers };
  },
  component: StudentProfile,
});

function StudentProfile() {
  const { rep, teaches, needs, reviews, myOffers } = Route.useLoaderData();

  const initials = rep.student.name.split(" ").map((s) => s[0]).slice(0, 2).join("");

  return (
    <section className="mx-3 mt-6 md:mx-6">
      <div className="mx-auto max-w-5xl">
        {/* Header card */}
        <div className="rounded-3xl bg-primary/40 border border-foreground/15 p-8 shadow-[3px_3px_0_0_var(--foreground)]">
          <div className="flex flex-wrap items-start gap-6">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-background border border-foreground/20 font-display text-3xl">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Student #{rep.student.student_id}
              </p>
              <h1 className="font-display text-5xl">{rep.student.name}</h1>
              <p className="text-sm text-muted-foreground">
                {rep.student.department} · Year {rep.student.year} · {rep.student.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <StarRating value={rep.avg_rating} />
                  <span className="text-sm">{rep.avg_rating.toFixed(2)} ({rep.total_ratings} reviews)</span>
                </span>
                <span className="text-sm">·</span>
                <span className="text-sm">Rep score <strong>{rep.reputation_score}</strong></span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {rep.badges.map((b) => <BadgeChip key={b.badge_name} name={b.badge_name} hint={b.criteria} />)}
                {rep.badges.length === 0 && <span className="text-xs text-muted-foreground">No badges yet</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-secondary border border-foreground/15 p-6 shadow-[3px_3px_0_0_var(--foreground)]">
            <h2 className="font-display text-2xl">Teaches</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {teaches.map((s) => <SubjectTag key={s.subject_id} tone="pink">{s.name}</SubjectTag>)}
              {teaches.length === 0 && <span className="text-xs text-muted-foreground">Not teaching anything yet.</span>}
            </div>
          </div>
          <div className="rounded-3xl bg-accent border border-foreground/15 p-6 shadow-[3px_3px_0_0_var(--foreground)]">
            <h2 className="font-display text-2xl">Needs help in</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {needs.map((s) => <SubjectTag key={s.subject_id} tone="mint">{s.name}</SubjectTag>)}
              {needs.length === 0 && <span className="text-xs text-muted-foreground">No active learning requests.</span>}
            </div>
          </div>
        </div>

        {/* Offers + Book CTA */}
        {myOffers.length > 0 && (
          <div className="mt-6 rounded-3xl bg-background border border-foreground/15 p-6">
            <h2 className="font-display text-2xl mb-3">Active offers</h2>
            <ul className="divide-y divide-foreground/10">
              {myOffers.map((o) => (
                <li key={o.offer_id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{o.subject_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.rate} · max {o.max_students} students · {o.category}
                    </p>
                  </div>
                  <PillLink
                    to="/book/$offerId"
                    params={{ offerId: String(o.offer_id) }}
                    className="!px-4 !py-1.5 !text-xs"
                  >
                    Book this
                  </PillLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-6 rounded-3xl bg-background border border-foreground/15 p-6">
          <h2 className="font-display text-2xl mb-3">Recent reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.slice().reverse().map((r) => (
                <li key={r.rating_id} className="rounded-2xl border border-foreground/10 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{r.rater.name}</p>
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
