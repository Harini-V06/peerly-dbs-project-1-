import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getActiveTutorsFn, getMatchFeedFn, getLearningSubjectsFn } from "@/data/serverQueries";
import { TutorCard } from "@/components/TutorCard";
import { PillLink } from "@/components/PillButton";
import { SubjectTag } from "@/components/SubjectTag";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "peerly. — the community for student tutors" },
      { name: "description", content: "Match with peers who can teach what you need to learn." },
    ],
  }),
  beforeLoad: ({ context }) => {
    if (!(context as any).currentUserId) throw redirect({ to: '/login' })
  },
  loader: async ({ context }) => {
    const studentId = (context as any).currentUserId as number
    const feed = await getMatchFeedFn({ data: { studentId } })
    const all = await getActiveTutorsFn()
    const myNeeds = await getLearningSubjectsFn({ data: { studentId } })
    return { feed, all, myNeeds }
  },
  component: Home,
});

function Home() {
  const { feed, all, myNeeds } = Route.useLoaderData()
  const showcase = feed.length > 0 ? feed : all.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="bg-grid relative mx-3 mt-4 overflow-hidden rounded-3xl border border-foreground/20 px-6 py-16 md:mx-6 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <span className="sticker">PEER LEARNING, BUT MAKE IT FUN</span>
          </div>
          <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">
            the community <br />
            for <span className="bg-primary px-2">student tutors</span> <br />
            <span className="italic">&amp; learners.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            List subjects you can teach, request help in subjects you need.
            We match you, you rate each other, your reputation grows. No formal
            tutoring fees, no gatekeeping.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PillLink to="/tutors">Find a tutor</PillLink>
            <PillLink to="/reputation" variant="outline">See my reputation</PillLink>
          </div>
        </div>
      </section>

      {/* MATCH FEED */}
      <section className="mx-3 mt-12 md:mx-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Your match feed</p>
              <h2 className="font-display text-4xl">tutors for what you need</h2>
              {myNeeds.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Based on your requests:</span>
                  {myNeeds.map((s) => (
                    <SubjectTag key={s.subject_id} tone="mint">{s.name}</SubjectTag>
                  ))}
                </div>
              )}
            </div>
            <Link to="/tutors" className="text-sm underline underline-offset-4">
              browse all tutors →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {showcase.map((t, i) => (
              <TutorCard key={t.offer_id} tutor={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-3 mt-16 md:mx-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-secondary border border-foreground/15 p-8 md:p-12 shadow-[3px_3px_0_0_var(--foreground)]">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-widest">how it works</p>
            <h2 className="font-display text-4xl mt-1">three steps to study smarter.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Post offers & requests", d: "List subjects you can teach and ones you need help in. Set your rate (free or paid) and weekly availability." },
              { n: "02", t: "Get matched & book", d: "Our matching engine connects compatible tutors and learners. Pick a slot and confirm a session in seconds." },
              { n: "03", t: "Rate & level up", d: "Both sides rate each session. Your reputation score updates automatically, and badges drop when milestones hit." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-background border border-foreground/15 p-5">
                <div className="font-display text-3xl text-primary-foreground/70">{s.n}</div>
                <h3 className="mt-2 font-display text-2xl">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
