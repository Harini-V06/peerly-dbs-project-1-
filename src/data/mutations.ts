// JS mirrors of the SQL triggers Person 4 owns.
// See `sql/01_triggers.sql` for the canonical implementations.

import {
  sessions, ratings, matches, teachingOffers, students,
  studentBadges, reputationLog,
  type Session, type Rating,
} from "./mockDb";

let nextSessionId = Math.max(...sessions.map((s) => s.session_id)) + 1;
let nextRatingId = Math.max(...ratings.map((r) => r.rating_id)) + 1;
let nextLogId = Math.max(0, ...reputationLog.map((l) => l.log_id)) + 1;
let nextMatchId = Math.max(...matches.map((m) => m.match_id)) + 1;

/** Equivalent to: INSERT INTO Session + the award_expert_badge trigger */
export function bookSession(params: {
  offer_id: number;
  learner_id: number;
  datetime: string;
  duration: number;
  mode: "Online" | "Offline";
}): Session {
  // create or reuse a match
  let match = matches.find(
    (m) => m.offer_id === params.offer_id &&
           teachingOffers.find((o) => o.offer_id === m.offer_id)?.student_id !== params.learner_id
  );
  if (!match) {
    match = { match_id: nextMatchId++, offer_id: params.offer_id, request_id: 0, status: "Accepted" };
    matches.push(match);
  }

  const session: Session = {
    session_id: nextSessionId++,
    match_id: match.match_id,
    datetime: params.datetime,
    duration: params.duration,
    mode: params.mode,
    status: "Scheduled",
  };
  sessions.push(session);
  return session;
}

/** Mark session completed and run the expert-badge trigger */
export function completeSession(sessionId: number) {
  const s = sessions.find((x) => x.session_id === sessionId);
  if (!s) return;
  s.status = "Completed";
  awardExpertBadge(sessionId);
}

/** trg_award_expert_badge — fires after a session goes to Completed */
function awardExpertBadge(sessionId: number) {
  const sess = sessions.find((s) => s.session_id === sessionId);
  if (!sess || sess.status !== "Completed") return;
  const match = matches.find((m) => m.match_id === sess.match_id);
  if (!match) return;
  const offer = teachingOffers.find((o) => o.offer_id === match.offer_id);
  if (!offer) return;

  const tutorId = offer.student_id;
  const completedCount = sessions.filter((s) => {
    if (s.status !== "Completed") return false;
    const m = matches.find((x) => x.match_id === s.match_id);
    if (!m) return false;
    const o = teachingOffers.find((x) => x.offer_id === m.offer_id);
    return o?.student_id === tutorId;
  }).length;

  if (completedCount >= 10) {
    const already = studentBadges.some((b) => b.student_id === tutorId && b.badge_id === 1);
    if (!already) {
      studentBadges.push({ student_id: tutorId, badge_id: 1, awarded_at: new Date().toISOString().slice(0, 10) });
    }
  }
}

/** INSERT INTO Rating + the trg_update_reputation trigger */
export function leaveRating(params: {
  session_id: number;
  rater_id: number;
  ratee_id: number;
  score: number;
  comment: string;
}): Rating {
  const rating: Rating = { rating_id: nextRatingId++, ...params };
  ratings.push(rating);
  updateReputation(params.ratee_id, `Rating received: ${params.score}★`);
  return rating;
}

/** trg_update_reputation — weighted recompute (recent ratings count more) */
function updateReputation(studentId: number, reason: string) {
  const student = students.find((s) => s.student_id === studentId);
  if (!student) return;
  const received = ratings.filter((r) => r.ratee_id === studentId);
  if (received.length === 0) return;

  // Weighted: newer ratings (higher rating_id) get linearly more weight.
  const sorted = [...received].sort((a, b) => a.rating_id - b.rating_id);
  const weights = sorted.map((_, i) => i + 1);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const weighted = sorted.reduce((acc, r, i) => acc + r.score * weights[i], 0) / wsum;
  const newScore = Math.round(weighted * 100) / 100;

  if (newScore !== student.reputation_score) {
    reputationLog.push({
      log_id: nextLogId++,
      student_id: studentId,
      old_score: student.reputation_score,
      new_score: newScore,
      reason,
      changed_at: new Date().toISOString().slice(0, 10),
    });
    student.reputation_score = newScore;
  }
}
