-- ============================================================
-- Person 4 — Views
-- Each view powers a screen in the frontend.
-- ============================================================

-- ------------------------------------------------------------
-- vw_active_tutors  -> Home / Tutors page
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_active_tutors AS
SELECT
    o.offer_id,
    s.student_id,
    s.name           AS student_name,
    s.department,
    s.year,
    sub.subject_id,
    sub.name         AS subject_name,
    sub.category,
    sub.difficulty_level,
    o.rate,
    o.max_students,
    s.reputation_score,
    COALESCE(AVG(r.score), s.reputation_score) AS avg_rating,
    COUNT(r.rating_id)                         AS total_ratings
FROM TeachingOffer o
JOIN Student  s   ON s.student_id  = o.student_id
JOIN Subject  sub ON sub.subject_id = o.subject_id
LEFT JOIN Rating r ON r.ratee_id = s.student_id
GROUP BY
    o.offer_id, s.student_id, s.name, s.department, s.year,
    sub.subject_id, sub.name, sub.category, sub.difficulty_level,
    o.rate, o.max_students, s.reputation_score;


-- ------------------------------------------------------------
-- vw_session_history  -> Session History page
-- One row per session, with tutor + learner + subject resolved.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_session_history AS
SELECT
    sess.session_id,
    sess.datetime,
    sess.duration,
    sess.mode,
    sess.status,
    sub.name AS subject_name,
    tutor.student_id   AS tutor_id,
    tutor.name         AS tutor_name,
    learner.student_id AS learner_id,
    learner.name       AS learner_name
FROM Session sess
JOIN MatchTable      m       ON m.match_id        = sess.match_id
JOIN TeachingOffer   o       ON o.offer_id        = m.offer_id
JOIN LearningRequest req     ON req.request_id    = m.request_id
JOIN Student         tutor   ON tutor.student_id  = o.student_id
JOIN Student         learner ON learner.student_id = req.student_id
JOIN Subject         sub     ON sub.subject_id    = o.subject_id;


-- ------------------------------------------------------------
-- vw_student_reputation  -> Reputation Dashboard
-- Reputation + badge count + completed-session count + dept rank.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vw_student_reputation AS
SELECT
    s.student_id,
    s.name,
    s.department,
    s.year,
    s.reputation_score,
    COALESCE(r_agg.avg_rating, s.reputation_score) AS avg_rating,
    COALESCE(r_agg.total_ratings, 0)               AS total_ratings,
    COALESCE(sess_agg.completed_sessions, 0)       AS completed_sessions,
    COALESCE(b_agg.badge_count, 0)                 AS badge_count,
    RANK() OVER (
        PARTITION BY s.department
        ORDER BY s.reputation_score DESC
    ) AS dept_rank
FROM Student s
LEFT JOIN (
    SELECT ratee_id, AVG(score) AS avg_rating, COUNT(*) AS total_ratings
    FROM Rating GROUP BY ratee_id
) r_agg ON r_agg.ratee_id = s.student_id
LEFT JOIN (
    SELECT o.student_id, COUNT(*) AS completed_sessions
    FROM Session sess
    JOIN MatchTable    m ON m.match_id = sess.match_id
    JOIN TeachingOffer o ON o.offer_id = m.offer_id
    WHERE sess.status = 'Completed'
    GROUP BY o.student_id
) sess_agg ON sess_agg.student_id = s.student_id
LEFT JOIN (
    SELECT student_id, COUNT(*) AS badge_count
    FROM StudentBadge GROUP BY student_id
) b_agg ON b_agg.student_id = s.student_id;
