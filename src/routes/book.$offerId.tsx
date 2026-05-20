import { createFileRoute, notFound, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import {
  getOfferByIdFn, getStudentByIdFn, getSubjectByIdFn, getAvailabilityForFn, bookSessionFn,
} from "@/data/serverQueries";
import { PillButton, PillLink } from "@/components/PillButton";
import { SubjectTag } from "@/components/SubjectTag";

export const Route = createFileRoute("/book/$offerId")({
  head: () => ({ meta: [{ title: "Book a session — peerly." }] }),
  beforeLoad: ({ context }) => {
    if (!(context as any).currentUserId) throw redirect({ to: '/login' })
  },
  loader: async ({ params, context }) => {
    const offerId = Number(params.offerId);
    const offer = await getOfferByIdFn({ data: { offerId } });
    if (!offer) throw notFound();
    const [tutor, subject, slots] = await Promise.all([
      getStudentByIdFn({ data: { id: offer.student_id } }),
      getSubjectByIdFn({ data: { subjectId: offer.subject_id } }),
      getAvailabilityForFn({ data: { studentId: offer.student_id } }),
    ]);
    const currentUserId = (context as any).currentUserId as number
    return { offer, tutor, subject, slots, currentUserId };
  },
  component: BookPage,
});

function nextDateForDay(day: string): string {
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const target = map[day];
  const d = new Date();
  const diff = (target - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function BookPage() {
  const { offer, tutor, subject, slots, currentUserId } = Route.useLoaderData();
  const navigate = useNavigate();

  const [slotIdx, setSlotIdx] = useState(0);
  const [mode, setMode] = useState<"Online" | "Offline">("Online");
  const [duration, setDuration] = useState(60);
  const [confirmed, setConfirmed] = useState<null | { id: number; when: string }>(null);

  const isSelf = tutor?.student_id === currentUserId;

  async function confirm() {
    if (!slots || slots.length === 0) return;
    const slot = slots[slotIdx];
    const dt = `${nextDateForDay(slot.day_of_week)}T${slot.start_time}:00`;
    const s = await bookSessionFn({
      data: {
        offer_id: offer.offer_id,
        learner_id: currentUserId,
        datetime: dt,
        duration,
        mode,
      }
    });
    setConfirmed({ id: s.session_id, when: dt });
  }

  if (confirmed) {
    return (
      <section className="mx-3 mt-10 md:mx-6">
        <div className="mx-auto max-w-xl rounded-3xl bg-secondary border border-foreground/15 p-8 text-center shadow-[3px_3px_0_0_var(--foreground)]">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-background border border-foreground/20 text-2xl">✓</div>
          <h1 className="font-display text-4xl">Session booked!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Session #{confirmed.id} with {tutor?.name} for {subject?.name} on{" "}
            {new Date(confirmed.when).toLocaleString()}.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <PillLink to="/sessions">View my sessions</PillLink>
            <PillLink to="/tutors" variant="outline">Find more tutors</PillLink>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-3 mt-6 md:mx-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Booking</p>
        <h1 className="font-display text-5xl">confirm your session.</h1>

        <div className="mt-6 rounded-3xl bg-primary/40 border border-foreground/15 p-6 shadow-[3px_3px_0_0_var(--foreground)]">
          <p className="text-sm">You're booking</p>
          <p className="font-display text-3xl">{subject?.name}</p>
          <p className="text-sm text-muted-foreground">
            with <strong>{tutor?.name}</strong> ({tutor?.department} · Year {tutor?.year})
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <SubjectTag tone="mint">{offer.rate}</SubjectTag>
            <SubjectTag tone="blue">{subject?.difficulty_level}</SubjectTag>
            <SubjectTag tone="peach">max {offer.max_students} students</SubjectTag>
          </div>
        </div>

        {isSelf ? (
          <p className="mt-6 rounded-2xl bg-background border border-foreground/15 p-5 text-sm text-muted-foreground">
            That's your own offer — you can't book yourself. Try another tutor.
          </p>
        ) : !slots || slots.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-background border border-foreground/15 p-5 text-sm text-muted-foreground">
            This tutor hasn't set availability yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 rounded-3xl bg-background border border-foreground/15 p-6">
            <div>
              <p className="mb-2 text-sm font-medium">Pick a time slot</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {slots.map((s: any, i: number) => (
                  <button
                    key={s.avail_id}
                    onClick={() => setSlotIdx(i)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                      slotIdx === i ? "border-foreground bg-secondary" : "border-foreground/15 bg-background"
                    }`}
                  >
                    <p className="font-medium">{s.day_of_week}</p>
                    <p className="text-xs text-muted-foreground">{s.start_time} – {s.end_time}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Mode</p>
              <div className="flex gap-1 rounded-full border border-foreground/20 bg-background p-1 w-fit">
                {(["Online", "Offline"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-full px-4 py-1.5 text-xs ${mode === m ? "bg-foreground text-background" : ""}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Duration: {duration} mins</p>
              <input
                type="range" min={30} max={120} step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <PillButton onClick={confirm} className="self-start">Confirm booking</PillButton>
          </div>
        )}
      </div>
    </section>
  );
}
