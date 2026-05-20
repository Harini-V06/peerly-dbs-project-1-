import { Link } from "@tanstack/react-router";
import type { ActiveTutor } from "@/data/queries";
import { SubjectTag } from "./SubjectTag";
import { StarRating } from "./StarRating";
import { PillLink } from "./PillButton";

const TONES = ["pink", "mint", "blue", "peach"] as const;

export function TutorCard({ tutor, index = 0 }: { tutor: ActiveTutor; index?: number }) {
  const tone = TONES[index % TONES.length];
  const bg = {
    pink: "bg-primary/40",
    mint: "bg-secondary",
    blue: "bg-accent",
    peach: "bg-[color:var(--peach)]",
  }[tone];

  const initials = tutor.student_name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <article
      className={`${bg} flex flex-col gap-4 rounded-3xl border border-foreground/15 p-5 shadow-[3px_3px_0_0_var(--foreground)]`}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-background border border-foreground/20 font-display text-lg">
          {initials}
        </div>
        <div className="min-w-0">
          <Link
            to="/students/$id"
            params={{ id: String(tutor.student_id) }}
            className="block truncate font-display text-xl leading-tight hover:underline"
          >
            {tutor.student_name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {tutor.department} · Year {tutor.year}
          </p>
        </div>
      </div>

      <div>
        <p className="font-display text-2xl leading-tight">{tutor.subject_name}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <SubjectTag tone="pink">{tutor.category}</SubjectTag>
          <SubjectTag tone="blue">{tutor.difficulty}</SubjectTag>
          <SubjectTag tone="mint">{tutor.rate}</SubjectTag>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-foreground/15 pt-3">
        <div className="flex items-center gap-2 text-sm">
          <StarRating value={tutor.avg_rating} />
          <span className="text-muted-foreground">
            {tutor.avg_rating.toFixed(1)} · {tutor.total_ratings} reviews
          </span>
        </div>
        <PillLink
          to="/book/$offerId"
          params={{ offerId: String(tutor.offer_id) }}
          className="!px-3 !py-1 !text-xs"
        >
          Book
        </PillLink>
      </div>
    </article>
  );
}
