# Person 4 — Frontend ⇄ DB Integration Notes

This is the "UI connection" half of Person 4's brief. It maps every frontend
screen to the SQL view, mutation, or trigger that powers it. The mock layer in
`src/data/queries.ts` and `src/data/mutations.ts` is named identically so the
swap to a real DB is mechanical.

## Screens ↔ SQL

| Screen | Frontend function | Backing SQL |
| --- | --- | --- |
| Home / Match Feed (`/`) | `getMatchFeed(studentId)` | `SELECT * FROM vw_active_tutors WHERE subject_id IN (SELECT subject_id FROM LearningRequest WHERE student_id = ?)` |
| Tutors (`/tutors`) | `getActiveTutors()` | `SELECT * FROM vw_active_tutors` |
| Student Profile (`/students/:id`) | `getStudentReputation(id)` + `getRatingsFor(id)` | `SELECT * FROM vw_student_reputation WHERE student_id = ?` + `SELECT * FROM Rating WHERE ratee_id = ?` |
| Booking (`/book/:offerId`) | `bookSession(...)` | `INSERT INTO Session(...)` (creates a Match row first if none exists) |
| Sessions (`/sessions`) | `getSessionHistory(userId)` + `completeSession()` + `leaveRating()` | `SELECT * FROM vw_session_history WHERE tutor_id = ? OR learner_id = ?`, `UPDATE Session SET status='Completed'`, `INSERT INTO Rating(...)` |
| Reputation (`/reputation`) | `getStudentReputation(userId)` | `SELECT * FROM vw_student_reputation WHERE student_id = ?` |

## Triggers fired by user actions

| User action | Trigger | What it does |
| --- | --- | --- |
| Mark a session "Completed" on `/sessions` | `trg_award_expert_badge` | If the tutor's completed-session count hits 10, inserts the Expert badge into `StudentBadge`. |
| Submit a rating on `/sessions` | `trg_update_reputation` | Recomputes `Student.reputation_score` as a weighted average and writes the delta to `ReputationLog`. |

The mock-layer functions in `src/data/mutations.ts` (`completeSession`,
`leaveRating`) call the JS equivalents of these triggers so the gamification
loop is demoable without a live DB.

## Swap to a real DB

1. Drop the seed data in `src/data/mockDb.ts` and replace `queries.ts` /
   `mutations.ts` implementations with real SQL calls (e.g. via a thin
   `fetch`-based API layer).
2. Keep the function signatures identical — the React components don't
   need to change.
3. Apply `sql/01_triggers.sql` and `sql/02_views.sql` to the database
   created by Person 3's `CREATE TABLE` script.
