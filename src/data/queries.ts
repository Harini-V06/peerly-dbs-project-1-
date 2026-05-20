// JS mirrors of the SQL views Person 4 owns.
// Names match `sql/02_views.sql` so swapping in a real DB is 1:1.

import {
  students, subjects, teachingOffers, learningRequests, matches,
  sessions, ratings, badges, studentBadges, availability,
  type Student,
} from "./mockDb";

export type ActiveTutor = {
  offer_id: number;
  student_id: number;
  student_name: string;
  department: string;
  year: number;
  subject_id: number;
  subject_name: string;
  category: string;
  difficulty: string;
  rate: "Free" | "Paid";
  max_students: number;
  reputation_score: number;
  avg_rating: number;
  total_ratings: number;
};

/** vw_active_tutors */
export function getActiveTutors(): ActiveTutor[] {
  return teachingOffers.map((o) => {
    const s = students.find((x) => x.student_id === o.student_id)!;
    const sub = subjects.find((x) => x.subject_id === o.subject_id)!;
    const received = ratings.filter((r) => r.ratee_id === s.student_id);
    const avg = received.length
      ? received.reduce((a, r) => a + r.score, 0) / received.length
      : s.reputation_score;
    return {
      offer_id: o.offer_id,
      student_id: s.student_id,
      student_name: s.name,
      department: s.department,
      year: s.year,
      subject_id: sub.subject_id,
      subject_name: sub.name,
      category: sub.category,
      difficulty: sub.difficulty_level,
      rate: o.rate,
      max_students: o.max_students,
      reputation_score: s.reputation_score,
      avg_rating: Math.round(avg * 10) / 10,
      total_ratings: received.length,
    };
  });
}

/** Tutors matching subjects the student requested */
export function getMatchFeed(studentId: number): ActiveTutor[] {
  const wantedSubjects = new Set(
    learningRequests.filter((r) => r.student_id === studentId).map((r) => r.subject_id)
  );
  return getActiveTutors().filter(
    (t) => wantedSubjects.has(t.subject_id) && t.student_id !== studentId
  );
}

export type SessionHistoryRow = {
  session_id: number;
  datetime: string;
  duration: number;
  mode: string;
  status: string;
  subject_name: string;
  tutor: Student;
  learner: Student;
  given_rating?: number;
  received_rating?: number;
};

/** vw_session_history — for a given student */
export function getSessionHistory(studentId: number): SessionHistoryRow[] {
  const rows: SessionHistoryRow[] = [];
  for (const sess of sessions) {
    const m = matches.find((x) => x.match_id === sess.match_id);
    if (!m) continue;
    const offer = teachingOffers.find((x) => x.offer_id === m.offer_id);
    if (!offer) continue;
    const tutor = students.find((x) => x.student_id === offer.student_id);
    if (!tutor) continue;
    // learner: from request if it exists, else any other session participant
    const req = learningRequests.find((x) => x.request_id === m.request_id);
    const learner =
      (req && students.find((x) => x.student_id === req.student_id)) ||
      students.find((x) => x.student_id !== tutor.student_id)!;
    const subj = subjects.find((x) => x.subject_id === offer.subject_id);
    if (!subj) continue;

    if (tutor.student_id !== studentId && learner.student_id !== studentId) continue;

    const given = ratings.find((r) => r.session_id === sess.session_id && r.rater_id === studentId);
    const received = ratings.find((r) => r.session_id === sess.session_id && r.ratee_id === studentId);

    rows.push({
      session_id: sess.session_id,
      datetime: sess.datetime,
      duration: sess.duration,
      mode: sess.mode,
      status: sess.status,
      subject_name: subj.name,
      tutor,
      learner,
      given_rating: given?.score,
      received_rating: received?.score,
    });
  }
  return rows.sort((a, b) => b.datetime.localeCompare(a.datetime));
}

export type StudentReputation = {
  student: Student;
  reputation_score: number;
  avg_rating: number;
  total_ratings: number;
  completed_sessions: number;
  badge_count: number;
  dept_rank: number;
  dept_total: number;
  badges: { badge_name: string; criteria: string; awarded_at: string }[];
};

/** vw_student_reputation */
export function getStudentReputation(studentId: number): StudentReputation {
  const student = students.find((s) => s.student_id === studentId)!;
  const received = ratings.filter((r) => r.ratee_id === studentId);
  const completed = sessions.filter((s) => {
    const m = matches.find((x) => x.match_id === s.match_id)!;
    const offer = teachingOffers.find((x) => x.offer_id === m.offer_id)!;
    return s.status === "Completed" && offer.student_id === studentId;
  }).length;

  const sb = studentBadges.filter((b) => b.student_id === studentId);
  const badgeRows = sb.map((b) => {
    const meta = badges.find((x) => x.badge_id === b.badge_id)!;
    return { badge_name: meta.badge_name, criteria: meta.criteria, awarded_at: b.awarded_at };
  });

  const dept = students.filter((s) => s.department === student.department);
  const ranked = [...dept].sort((a, b) => b.reputation_score - a.reputation_score);
  const dept_rank = ranked.findIndex((s) => s.student_id === studentId) + 1;

  const avg = received.length
    ? received.reduce((a, r) => a + r.score, 0) / received.length
    : student.reputation_score;

  return {
    student,
    reputation_score: student.reputation_score,
    avg_rating: Math.round(avg * 10) / 10,
    total_ratings: received.length,
    completed_sessions: completed,
    badge_count: sb.length,
    dept_rank,
    dept_total: dept.length,
    badges: badgeRows,
  };
}

export function getStudentById(id: number) {
  return students.find((s) => s.student_id === id);
}
export function getSubjectById(id: number) {
  return subjects.find((s) => s.subject_id === id);
}
export function getOfferById(id: number) {
  return teachingOffers.find((o) => o.offer_id === id);
}
export function getAvailabilityFor(studentId: number) {
  return availability.filter((a) => a.student_id === studentId);
}
export function getRatingsFor(studentId: number) {
  return ratings
    .filter((r) => r.ratee_id === studentId)
    .map((r) => ({
      ...r,
      rater: students.find((s) => s.student_id === r.rater_id)!,
    }));
}
export function getTeachingSubjects(studentId: number) {
  return teachingOffers
    .filter((o) => o.student_id === studentId)
    .map((o) => subjects.find((s) => s.subject_id === o.subject_id)!);
}
export function getLearningSubjects(studentId: number) {
  return learningRequests
    .filter((r) => r.student_id === studentId)
    .map((r) => subjects.find((s) => s.subject_id === r.subject_id)!);
}
