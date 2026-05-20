// In-memory store mirroring Person 3's SQL schema 1:1.
// Seeded with the INSERT statements from SQL_QUERIES.pdf plus extra rows
// so the UI looks populated.

export type Student = {
  student_id: number;
  name: string;
  email: string;
  year: number;
  department: string;
  reputation_score: number;
};

export type Subject = {
  subject_id: number;
  name: string;
  category: string;
  difficulty_level: "Easy" | "Medium" | "Hard";
};

export type TeachingOffer = {
  offer_id: number;
  student_id: number;
  subject_id: number;
  rate: "Free" | "Paid";
  max_students: number;
};

export type LearningRequest = {
  request_id: number;
  student_id: number;
  subject_id: number;
  urgency: "Low" | "Medium" | "High";
};

export type MatchRow = {
  match_id: number;
  offer_id: number;
  request_id: number;
  status: "Pending" | "Accepted" | "Rejected" | "Completed";
};

export type Session = {
  session_id: number;
  match_id: number;
  datetime: string; // ISO
  duration: number; // mins
  mode: "Online" | "Offline";
  status: "Scheduled" | "Completed" | "Cancelled";
};

export type Rating = {
  rating_id: number;
  session_id: number;
  rater_id: number;
  ratee_id: number;
  score: number; // 1-5
  comment: string;
};

export type Badge = {
  badge_id: number;
  badge_name: string;
  criteria: string;
};

export type StudentBadge = {
  student_id: number;
  badge_id: number;
  awarded_at: string;
};

export type Availability = {
  avail_id: number;
  student_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
};

export type ReputationLog = {
  log_id: number;
  student_id: number;
  old_score: number;
  new_score: number;
  reason: string;
  changed_at: string;
};

// ---- Seed data ----------------------------------------------------------

export const students: Student[] = [
  { student_id: 1, name: "Alice Chen",      email: "alice@mail.com",   year: 2, department: "CS", reputation_score: 4.5 },
  { student_id: 2, name: "Bob Patel",       email: "bob@mail.com",     year: 3, department: "CS", reputation_score: 3.8 },
  { student_id: 3, name: "Charlie Okafor",  email: "charlie@mail.com", year: 1, department: "IT", reputation_score: 4.2 },
  { student_id: 4, name: "Diya Sharma",     email: "diya@mail.com",    year: 4, department: "EE", reputation_score: 4.7 },
  { student_id: 5, name: "Ethan Wright",    email: "ethan@mail.com",   year: 2, department: "ME", reputation_score: 3.5 },
  { student_id: 6, name: "Farah Hossain",   email: "farah@mail.com",   year: 3, department: "CS", reputation_score: 4.9 },
  { student_id: 7, name: "Gabriel Lima",    email: "gabe@mail.com",    year: 2, department: "IT", reputation_score: 4.1 },
  { student_id: 8, name: "Hannah Müller",   email: "hannah@mail.com",  year: 4, department: "EE", reputation_score: 4.3 },
];

export const subjects: Subject[] = [
  { subject_id: 101, name: "Calculus",          category: "Math",     difficulty_level: "Medium" },
  { subject_id: 102, name: "Physics I",         category: "Science",  difficulty_level: "Hard" },
  { subject_id: 103, name: "Data Structures",   category: "CS",       difficulty_level: "Hard" },
  { subject_id: 104, name: "Linear Algebra",    category: "Math",     difficulty_level: "Medium" },
  { subject_id: 105, name: "Discrete Math",     category: "Math",     difficulty_level: "Medium" },
  { subject_id: 106, name: "Operating Systems", category: "CS",       difficulty_level: "Hard" },
  { subject_id: 107, name: "Circuits",          category: "EE",       difficulty_level: "Medium" },
  { subject_id: 108, name: "Statistics",        category: "Math",     difficulty_level: "Easy" },
];

export const teachingOffers: TeachingOffer[] = [
  { offer_id: 1, student_id: 1, subject_id: 101, rate: "Free", max_students: 5 },
  { offer_id: 2, student_id: 2, subject_id: 102, rate: "Paid", max_students: 3 },
  { offer_id: 3, student_id: 4, subject_id: 104, rate: "Free", max_students: 4 },
  { offer_id: 4, student_id: 6, subject_id: 103, rate: "Paid", max_students: 6 },
  { offer_id: 5, student_id: 6, subject_id: 106, rate: "Free", max_students: 5 },
  { offer_id: 6, student_id: 8, subject_id: 107, rate: "Paid", max_students: 3 },
  { offer_id: 7, student_id: 7, subject_id: 105, rate: "Free", max_students: 4 },
  { offer_id: 8, student_id: 4, subject_id: 108, rate: "Free", max_students: 5 },
];

export const learningRequests: LearningRequest[] = [
  { request_id: 1, student_id: 3, subject_id: 101, urgency: "High" },
  { request_id: 2, student_id: 1, subject_id: 102, urgency: "Medium" },
  { request_id: 3, student_id: 5, subject_id: 103, urgency: "High" },
  { request_id: 4, student_id: 3, subject_id: 104, urgency: "Low" },
  { request_id: 5, student_id: 1, subject_id: 106, urgency: "Medium" },
  { request_id: 6, student_id: 7, subject_id: 107, urgency: "Medium" },
];

export const matches: MatchRow[] = [
  { match_id: 1, offer_id: 1, request_id: 1, status: "Completed" },
  { match_id: 2, offer_id: 2, request_id: 2, status: "Accepted" },
  { match_id: 3, offer_id: 4, request_id: 3, status: "Completed" },
  { match_id: 4, offer_id: 5, request_id: 5, status: "Accepted" },
  { match_id: 5, offer_id: 6, request_id: 6, status: "Pending" },
];

export const sessions: Session[] = [
  { session_id: 1, match_id: 1, datetime: "2026-05-12T10:00:00", duration: 60, mode: "Online",  status: "Completed" },
  { session_id: 2, match_id: 1, datetime: "2026-05-15T14:00:00", duration: 45, mode: "Offline", status: "Completed" },
  { session_id: 3, match_id: 3, datetime: "2026-05-18T16:00:00", duration: 90, mode: "Online",  status: "Completed" },
  { session_id: 4, match_id: 2, datetime: "2026-05-22T11:00:00", duration: 60, mode: "Online",  status: "Scheduled" },
  { session_id: 5, match_id: 4, datetime: "2026-05-24T15:00:00", duration: 60, mode: "Offline", status: "Scheduled" },
];

export const ratings: Rating[] = [
  { rating_id: 1, session_id: 1, rater_id: 3, ratee_id: 1, score: 5, comment: "Great tutor — really patient!" },
  { rating_id: 2, session_id: 1, rater_id: 1, ratee_id: 3, score: 4, comment: "Engaged learner, asked good questions." },
  { rating_id: 3, session_id: 2, rater_id: 3, ratee_id: 1, score: 5, comment: "Cleared up everything before the exam." },
  { rating_id: 4, session_id: 3, rater_id: 5, ratee_id: 6, score: 5, comment: "Best DS explanation I've had." },
];

export const badges: Badge[] = [
  { badge_id: 1, badge_name: "Expert",       criteria: "Complete 10 sessions" },
  { badge_id: 2, badge_name: "Rising Star",  criteria: "Reputation above 4.5" },
  { badge_id: 3, badge_name: "Helping Hand", criteria: "Teach 3+ subjects" },
];

export const studentBadges: StudentBadge[] = [
  { student_id: 1, badge_id: 2, awarded_at: "2026-04-10" },
  { student_id: 4, badge_id: 2, awarded_at: "2026-03-22" },
  { student_id: 4, badge_id: 3, awarded_at: "2026-04-01" },
  { student_id: 6, badge_id: 2, awarded_at: "2026-04-18" },
];

export const availability: Availability[] = [
  { avail_id: 1, student_id: 1, day_of_week: "Mon", start_time: "10:00", end_time: "12:00" },
  { avail_id: 2, student_id: 1, day_of_week: "Wed", start_time: "14:00", end_time: "16:00" },
  { avail_id: 3, student_id: 2, day_of_week: "Tue", start_time: "11:00", end_time: "13:00" },
  { avail_id: 4, student_id: 4, day_of_week: "Thu", start_time: "09:00", end_time: "11:00" },
  { avail_id: 5, student_id: 4, day_of_week: "Fri", start_time: "15:00", end_time: "17:00" },
  { avail_id: 6, student_id: 6, day_of_week: "Mon", start_time: "16:00", end_time: "18:00" },
  { avail_id: 7, student_id: 6, day_of_week: "Wed", start_time: "10:00", end_time: "12:00" },
  { avail_id: 8, student_id: 7, day_of_week: "Tue", start_time: "14:00", end_time: "16:00" },
  { avail_id: 9, student_id: 8, day_of_week: "Fri", start_time: "11:00", end_time: "13:00" },
];

export const reputationLog: ReputationLog[] = [
  { log_id: 1, student_id: 1, old_score: 4.3, new_score: 4.5, reason: "Rating received: 5★ from Charlie", changed_at: "2026-05-12" },
  { log_id: 2, student_id: 6, old_score: 4.7, new_score: 4.9, reason: "Rating received: 5★ from Ethan",   changed_at: "2026-05-18" },
];

// Pretend signed-in user
export const CURRENT_USER_ID = 1;
