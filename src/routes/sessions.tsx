import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { getSessionHistoryFn, completeSessionFn, leaveRatingFn, type SessionHistoryRow } from "@/data/serverQueries";
import { StarRating } from "@/components/StarRating";
import { PillButton } from "@/components/PillButton";
import { SubjectTag } from "@/components/SubjectTag";

export const Route = createFileRoute("/sessions")({
  head: () => ({ meta: [{ title: "My sessions — peerly." }] }),
  beforeLoad: ({ context }) => {
    if (!(context as any).currentUserId) throw redirect({ to: '/login' })
  },
  loader: async ({ context }) => {
    const studentId = (context as any).currentUserId as number
    const rows = await getSessionHistoryFn({ data: { studentId } })
    return { rows, studentId }
  },
  component: SessionsPage,
});

function SessionsPage() {
  const router = useRouter();
  const { rows, studentId } = Route.useLoaderData()
  const CURRENT_USER_ID = studentId
  const [ratingFor, setRatingFor] = useState<number | null>(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  async function submitRating(row: SessionHistoryRow) {
    const ratee = row.tutor.student_id === CURRENT_USER_ID ? row.learner : row.tutor;
    await leaveRatingFn({
      data: {
        session_id: row.session_id,
        rater_id: CURRENT_USER_ID,
        ratee_id: ratee.student_id,
        score,
        comment: comment || "(no comment)",
      }
    });
    setRatingFor(null); setScore(5); setComment("");
    router.invalidate();
  }

  async function markComplete(sessionId: number) {
    await completeSessionFn({ data: { sessionId } });
    router.invalidate();
  }

  return (
    <section className="mx-3 mt-6 md:mx-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">My sessions</p>
        <h1 className="font-display text-5xl">past &amp; upcoming.</h1>

        <div className="mt-6 grid gap-4">
          {rows.length === 0 && (
            <p className="rounded-2xl bg-background border border-foreground/15 p-6 text-sm text-muted-foreground">
              No sessions yet — book one from the tutors page.
            </p>
          )}
          {rows.map((row) => {
            const iAmTutor = row.tutor.student_id === CURRENT_USER_ID;
            const other = iAmTutor ? row.learner : row.tutor;
            const role = iAmTutor ? "Teaching" : "Learning";
            const canRate = row.status === "Completed" && row.given_rating === undefined;
            return (
              <article
                key={row.session_id}
                className="rounded-3xl bg-background border border-foreground/15 p-5 shadow-[2px_2px_0_0_var(--foreground)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-2xl">{row.subject_name}</span>
                      <SubjectTag tone={row.status === "Completed" ? "mint" : row.status === "Scheduled" ? "blue" : "pink"}>
                        {row.status}
                      </SubjectTag>
                      <SubjectTag tone="peach">{role}</SubjectTag>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {role === "Teaching" ? "Learner" : "Tutor"}: <strong>{other.name}</strong> · {other.department}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(row.datetime).toLocaleString()} · {row.duration} mins · {row.mode}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {row.given_rating !== undefined && (
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        You gave: <StarRating value={row.given_rating} />
                      </span>
                    )}
                    {row.received_rating !== undefined && (
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        You received: <StarRating value={row.received_rating} />
                      </span>
                    )}
                    {row.status === "Scheduled" && (
                      <PillButton variant="outline" onClick={() => markComplete(row.session_id)} className="!px-3 !py-1 !text-xs">
                        Mark complete
                      </PillButton>
                    )}
                    {canRate && (
                      <PillButton onClick={() => setRatingFor(row.session_id)} className="!px-3 !py-1 !text-xs">
                        Rate session
                      </PillButton>
                    )}
                  </div>
                </div>

                {ratingFor === row.session_id && (
                  <div className="mt-4 rounded-2xl border border-foreground/15 bg-secondary p-4">
                    <p className="text-sm font-medium">Rate {other.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setScore(n)}
                          className={`h-9 w-9 rounded-full border ${n === score ? "bg-foreground text-background" : "border-foreground/30"}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Leave a quick comment…"
                      className="mt-3 w-full rounded-2xl border border-foreground/15 bg-background p-3 text-sm"
                      rows={2}
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <PillButton variant="outline" onClick={() => setRatingFor(null)} className="!px-3 !py-1 !text-xs">
                        Cancel
                      </PillButton>
                      <PillButton onClick={() => submitRating(row)} className="!px-3 !py-1 !text-xs">
                        Submit
                      </PillButton>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
