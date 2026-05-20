-- ============================================================
-- Peerly – Full MySQL Setup Script
-- Run this once on your Railway MySQL database.
-- Creates all tables (3NF normalized), views, triggers, seed data.
-- ============================================================

CREATE DATABASE IF NOT EXISTS peerly
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE peerly;

-- ============================================================
-- SECTION 1: TABLES (normalized to BCNF)
-- ============================================================

CREATE TABLE IF NOT EXISTS Department (
    dept_id INT          PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    code    VARCHAR(10)  NOT NULL UNIQUE,
    faculty VARCHAR(100) NOT NULL
    -- Resolves 3NF transitive dependency: student_id → dept → faculty
);

CREATE TABLE IF NOT EXISTS Subject (
    subject_id       INT          PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    category         VARCHAR(50),
    difficulty_level VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS Badge (
    badge_id   INT          PRIMARY KEY AUTO_INCREMENT,
    badge_name VARCHAR(50)  NOT NULL,
    criteria   VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Student (
    student_id       INT           PRIMARY KEY AUTO_INCREMENT,
    name             VARCHAR(100)  NOT NULL,
    email            VARCHAR(100)  NOT NULL UNIQUE,
    phone            VARCHAR(20),
    year             INT,
    dept_id          INT,
    reputation_score DECIMAL(5,2)  DEFAULT 5.00,
    password         VARCHAR(100)  DEFAULT 'password123',
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES Department(dept_id) ON DELETE RESTRICT
    -- dept_id FK enforces 3NF: faculty details live in Department, not here
);

CREATE TABLE IF NOT EXISTS Availability (
    avail_id     INT         PRIMARY KEY AUTO_INCREMENT,
    student_id   INT         NOT NULL,
    day_of_week  VARCHAR(15) NOT NULL,
    start_time   TIME        NOT NULL,
    end_time     TIME        NOT NULL,
    is_recurring BOOLEAN     DEFAULT TRUE,
    -- Separate table satisfies 1NF: no multi-valued availability in Student
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS TeachingOffer (
    offer_id     INT           PRIMARY KEY AUTO_INCREMENT,
    student_id   INT           NOT NULL,
    subject_id   INT           NOT NULL,
    rate_type    VARCHAR(10)   DEFAULT 'Free',   -- 'Free' or 'Paid'
    hourly_rate  DECIMAL(6,2)  NOT NULL DEFAULT 0.00,
    max_students INT           DEFAULT 1,
    is_active    BOOLEAN       DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subject(subject_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS LearningRequest (
    request_id INT          PRIMARY KEY AUTO_INCREMENT,
    student_id INT          NOT NULL,
    subject_id INT          NOT NULL,
    urgency    VARCHAR(20),
    is_active  BOOLEAN      DEFAULT TRUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subject(subject_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS MatchTable (
    match_id   INT         PRIMARY KEY AUTO_INCREMENT,
    offer_id   INT         NOT NULL,
    request_id INT         NOT NULL,
    status     VARCHAR(20) DEFAULT 'Pending',
    matched_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (request_id),   -- BCNF: one request can only ever have one match
    FOREIGN KEY (offer_id)   REFERENCES TeachingOffer(offer_id)     ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES LearningRequest(request_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Session (
    session_id INT          PRIMARY KEY AUTO_INCREMENT,
    match_id   INT          NOT NULL,
    datetime   DATETIME     NOT NULL,
    duration   INT          NOT NULL,   -- minutes
    mode       VARCHAR(20)  NOT NULL,
    status     VARCHAR(20)  DEFAULT 'Scheduled',
    location   VARCHAR(255),
    -- NOTE: No tutor_id column. Tutor resolved via: Session → MatchTable → TeachingOffer
    FOREIGN KEY (match_id) REFERENCES MatchTable(match_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Rating (
    rating_id  INT          PRIMARY KEY AUTO_INCREMENT,
    session_id INT          NOT NULL,
    rater_id   INT          NOT NULL,
    ratee_id   INT          NOT NULL,
    score      INT          NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment    VARCHAR(255),
    rated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Session(session_id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id)   REFERENCES Student(student_id) ON DELETE RESTRICT,
    FOREIGN KEY (ratee_id)   REFERENCES Student(student_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS SessionNote (
    note_id    INT       PRIMARY KEY AUTO_INCREMENT,
    session_id INT       NOT NULL,
    tutor_id   INT       NOT NULL,
    student_id INT       NOT NULL,
    note_text  TEXT      NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Session(session_id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id)   REFERENCES Student(student_id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS StudentBadge (
    sb_id              INT       PRIMARY KEY AUTO_INCREMENT,
    student_id         INT       NOT NULL,
    badge_id           INT       NOT NULL,
    awarded_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    awarded_by_trigger BOOLEAN   DEFAULT TRUE,
    UNIQUE (student_id, badge_id),   -- prevents duplicate badge awards
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id)   REFERENCES Badge(badge_id)     ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ReputationLog (
    log_id     INT            PRIMARY KEY AUTO_INCREMENT,
    student_id INT            NOT NULL,
    old_score  DECIMAL(5,2)   NOT NULL,
    new_score  DECIMAL(5,2)   NOT NULL,
    reason     VARCHAR(255),
    changed_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE
);

-- ============================================================
-- SECTION 2: SEED DATA (mirrors mockDb.ts exactly)
-- ============================================================

INSERT IGNORE INTO Department (dept_id, name, code, faculty) VALUES
    (10, 'Computer Science',       'CS', 'Faculty of Engineering'),
    (20, 'Information Technology', 'IT', 'Faculty of Engineering'),
    (30, 'Electrical Engineering', 'EE', 'Faculty of Engineering'),
    (40, 'Mechanical Engineering', 'ME', 'Faculty of Engineering');

INSERT IGNORE INTO Subject (subject_id, name, category, difficulty_level) VALUES
    (101, 'Calculus',          'Math',    'Medium'),
    (102, 'Physics I',         'Science', 'Hard'),
    (103, 'Data Structures',   'CS',      'Hard'),
    (104, 'Linear Algebra',    'Math',    'Medium'),
    (105, 'Discrete Math',     'Math',    'Medium'),
    (106, 'Operating Systems', 'CS',      'Hard'),
    (107, 'Circuits',          'EE',      'Medium'),
    (108, 'Statistics',        'Math',    'Easy');

INSERT IGNORE INTO Badge (badge_id, badge_name, criteria) VALUES
    (1, 'Expert',       'Complete 10 sessions'),
    (2, 'Rising Star',  'Reputation above 4.5'),
    (3, 'Helping Hand', 'Teach 3+ subjects');

-- Students: password='password123' for all (demo purposes)
INSERT IGNORE INTO Student (student_id, name, email, phone, year, dept_id, reputation_score, password) VALUES
    (1, 'Alice Chen',     'alice@mail.com',   '+123456789', 2, 10, 4.50, 'password123'),
    (2, 'Bob Patel',      'bob@mail.com',     '+987654321', 3, 10, 3.80, 'password123'),
    (3, 'Charlie Okafor', 'charlie@mail.com', '+555444333', 1, 20, 4.20, 'password123'),
    (4, 'Diya Sharma',    'diya@mail.com',    '+111222333', 4, 30, 4.70, 'password123'),
    (5, 'Ethan Wright',   'ethan@mail.com',   '+444555666', 2, 40, 3.50, 'password123'),
    (6, 'Farah Hossain',  'farah@mail.com',   '+777888999', 3, 10, 4.90, 'password123'),
    (7, 'Gabriel Lima',   'gabe@mail.com',    '+222333444', 2, 20, 4.10, 'password123'),
    (8, 'Hannah Müller',  'hannah@mail.com',  '+888999000', 4, 30, 4.30, 'password123');

INSERT IGNORE INTO Availability (avail_id, student_id, day_of_week, start_time, end_time, is_recurring) VALUES
    (1, 1, 'Monday',    '10:00:00', '12:00:00', TRUE),
    (2, 1, 'Wednesday', '14:00:00', '16:00:00', TRUE),
    (3, 2, 'Tuesday',   '11:00:00', '13:00:00', TRUE),
    (4, 4, 'Thursday',  '09:00:00', '11:00:00', TRUE),
    (5, 4, 'Friday',    '15:00:00', '17:00:00', TRUE),
    (6, 6, 'Monday',    '16:00:00', '18:00:00', TRUE),
    (7, 6, 'Wednesday', '10:00:00', '12:00:00', TRUE),
    (8, 7, 'Tuesday',   '14:00:00', '16:00:00', TRUE),
    (9, 8, 'Friday',    '11:00:00', '13:00:00', TRUE);

INSERT IGNORE INTO TeachingOffer (offer_id, student_id, subject_id, rate_type, hourly_rate, max_students) VALUES
    (1, 1, 101, 'Free', 0.00,  5),
    (2, 2, 102, 'Paid', 25.00, 3),
    (3, 4, 104, 'Free', 0.00,  4),
    (4, 6, 103, 'Paid', 20.00, 6),
    (5, 6, 106, 'Free', 0.00,  5),
    (6, 8, 107, 'Paid', 15.00, 3),
    (7, 7, 105, 'Free', 0.00,  4),
    (8, 4, 108, 'Free', 0.00,  5);

INSERT IGNORE INTO LearningRequest (request_id, student_id, subject_id, urgency) VALUES
    (1, 3, 101, 'High'),
    (2, 1, 102, 'Medium'),
    (3, 5, 103, 'High'),
    (4, 3, 104, 'Low'),
    (5, 1, 106, 'Medium'),
    (6, 7, 107, 'Medium');

INSERT IGNORE INTO MatchTable (match_id, offer_id, request_id, status) VALUES
    (1, 1, 1, 'Completed'),
    (2, 2, 2, 'Accepted'),
    (3, 4, 3, 'Completed'),
    (4, 5, 5, 'Accepted'),
    (5, 6, 6, 'Pending');

INSERT IGNORE INTO Session (session_id, match_id, datetime, duration, mode, status, location) VALUES
    (1, 1, '2026-05-12 10:00:00', 60, 'Online',  'Completed', 'Zoom Link'),
    (2, 1, '2026-05-15 14:00:00', 45, 'Offline', 'Completed', 'Library Room 3'),
    (3, 3, '2026-05-18 16:00:00', 90, 'Online',  'Completed', 'Google Meet'),
    (4, 2, '2026-05-22 11:00:00', 60, 'Online',  'Scheduled', 'Zoom Link'),
    (5, 4, '2026-05-24 15:00:00', 60, 'Offline', 'Scheduled', 'Study Hall B');

INSERT IGNORE INTO Rating (rating_id, session_id, rater_id, ratee_id, score, comment) VALUES
    (1, 1, 3, 1, 5, 'Great tutor — really patient!'),
    (2, 1, 1, 3, 4, 'Engaged learner, asked good questions.'),
    (3, 2, 3, 1, 5, 'Cleared up everything before the exam.'),
    (4, 3, 5, 6, 5, 'Best DS explanation I have had.');

INSERT IGNORE INTO SessionNote (note_id, session_id, tutor_id, student_id, note_text) VALUES
    (1, 1, 1, 3, 'Charlie understood linear algebraic projections quickly.');

INSERT IGNORE INTO StudentBadge (sb_id, student_id, badge_id, awarded_by_trigger) VALUES
    (1, 1, 2, FALSE),
    (2, 4, 2, FALSE),
    (3, 4, 3, FALSE),
    (4, 6, 2, FALSE);

INSERT IGNORE INTO ReputationLog (log_id, student_id, old_score, new_score, reason) VALUES
    (1, 1, 4.30, 4.50, 'Rating received: 5 stars from Charlie'),
    (2, 6, 4.70, 4.90, 'Rating received: 5 stars from Ethan');

-- ============================================================
-- SECTION 3: VIEWS
-- Fixed from original sql/02_views.sql: s.department → d.code AS department
-- (Student table is normalized: uses dept_id FK, not department string)
-- ============================================================

CREATE OR REPLACE VIEW vw_active_tutors AS
SELECT
    o.offer_id,
    s.student_id,
    s.name             AS student_name,
    d.code             AS department,
    s.year,
    sub.subject_id,
    sub.name           AS subject_name,
    sub.category,
    sub.difficulty_level,
    o.rate_type        AS rate,
    o.max_students,
    s.reputation_score,
    COALESCE(AVG(r.score), s.reputation_score) AS avg_rating,
    COUNT(r.rating_id)                         AS total_ratings
FROM TeachingOffer o
JOIN Student    s   ON s.student_id   = o.student_id
JOIN Department d   ON d.dept_id      = s.dept_id
JOIN Subject    sub ON sub.subject_id = o.subject_id
LEFT JOIN Rating r  ON r.ratee_id     = s.student_id
WHERE o.is_active = TRUE
GROUP BY
    o.offer_id, s.student_id, s.name, d.code, s.year,
    sub.subject_id, sub.name, sub.category, sub.difficulty_level,
    o.rate_type, o.max_students, s.reputation_score;

CREATE OR REPLACE VIEW vw_session_history AS
SELECT
    sess.session_id,
    sess.datetime,
    sess.duration,
    sess.mode,
    sess.status,
    sub.name           AS subject_name,
    tutor.student_id   AS tutor_id,
    tutor.name         AS tutor_name,
    dt.code            AS tutor_dept,
    learner.student_id AS learner_id,
    learner.name       AS learner_name,
    dl.code            AS learner_dept
FROM Session           sess
JOIN MatchTable        m       ON m.match_id        = sess.match_id
JOIN TeachingOffer     o       ON o.offer_id        = m.offer_id
JOIN LearningRequest   req     ON req.request_id    = m.request_id
JOIN Student           tutor   ON tutor.student_id  = o.student_id
JOIN Department        dt      ON dt.dept_id        = tutor.dept_id
JOIN Student           learner ON learner.student_id = req.student_id
JOIN Department        dl      ON dl.dept_id        = learner.dept_id
JOIN Subject           sub     ON sub.subject_id    = o.subject_id;

CREATE OR REPLACE VIEW vw_student_reputation AS
SELECT
    s.student_id,
    s.name,
    d.code             AS department,
    s.year,
    s.reputation_score,
    COALESCE(r_agg.avg_rating,   s.reputation_score) AS avg_rating,
    COALESCE(r_agg.total_ratings, 0)                 AS total_ratings,
    COALESCE(sess_agg.completed_sessions, 0)         AS completed_sessions,
    COALESCE(b_agg.badge_count, 0)                   AS badge_count,
    RANK() OVER (
        PARTITION BY s.dept_id
        ORDER BY s.reputation_score DESC
    ) AS dept_rank
FROM Student s
JOIN Department d ON d.dept_id = s.dept_id
LEFT JOIN (
    SELECT ratee_id, AVG(score) AS avg_rating, COUNT(*) AS total_ratings
    FROM Rating GROUP BY ratee_id
) r_agg ON r_agg.ratee_id = s.student_id
LEFT JOIN (
    SELECT o.student_id, COUNT(*) AS completed_sessions
    FROM Session sess
    JOIN MatchTable    m ON m.match_id = sess.match_id
    JOIN TeachingOffer o ON o.offer_id  = m.offer_id
    WHERE sess.status = 'Completed'
    GROUP BY o.student_id
) sess_agg ON sess_agg.student_id = s.student_id
LEFT JOIN (
    SELECT student_id, COUNT(*) AS badge_count
    FROM StudentBadge GROUP BY student_id
) b_agg ON b_agg.student_id = s.student_id;

-- ============================================================
-- SECTION 4: TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_award_expert_badge;

DELIMITER //
CREATE TRIGGER trg_award_expert_badge
AFTER UPDATE ON Session
FOR EACH ROW
BEGIN
    DECLARE v_tutor_id INT;
    DECLARE v_completed INT;

    IF NEW.status = 'Completed' AND OLD.status <> 'Completed' THEN
        SELECT o.student_id INTO v_tutor_id
        FROM MatchTable m
        JOIN TeachingOffer o ON o.offer_id = m.offer_id
        WHERE m.match_id = NEW.match_id;

        SELECT COUNT(*) INTO v_completed
        FROM Session s
        JOIN MatchTable m ON m.match_id = s.match_id
        JOIN TeachingOffer o ON o.offer_id = m.offer_id
        WHERE o.student_id = v_tutor_id AND s.status = 'Completed';

        IF v_completed >= 10 THEN
            INSERT IGNORE INTO StudentBadge (student_id, badge_id)
            VALUES (v_tutor_id, 1);
        END IF;
    END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_update_reputation;

DELIMITER //
CREATE TRIGGER trg_update_reputation
AFTER INSERT ON Rating
FOR EACH ROW
BEGIN
    DECLARE v_old DECIMAL(5,2);
    DECLARE v_new DECIMAL(5,2);

    SELECT reputation_score INTO v_old
    FROM Student WHERE student_id = NEW.ratee_id;

    SELECT ROUND(SUM(score * rn) / SUM(rn), 2) INTO v_new
    FROM (
        SELECT score,
               ROW_NUMBER() OVER (PARTITION BY ratee_id ORDER BY rating_id) AS rn
        FROM Rating
        WHERE ratee_id = NEW.ratee_id
    ) AS weighted;

    UPDATE Student
    SET reputation_score = v_new
    WHERE student_id = NEW.ratee_id;

    INSERT INTO ReputationLog (student_id, old_score, new_score, reason, changed_at)
    VALUES (NEW.ratee_id, v_old, v_new,
            CONCAT('Rating received: ', NEW.score, ' stars'),
            NOW());
END//
DELIMITER ;

-- ============================================================
-- SECTION 5: VERIFICATION
-- Run this to confirm the setup was successful.
-- ============================================================
SELECT 'Department'     AS tbl, COUNT(*) AS rows FROM Department
UNION ALL SELECT 'Student',       COUNT(*) FROM Student
UNION ALL SELECT 'Subject',       COUNT(*) FROM Subject
UNION ALL SELECT 'TeachingOffer', COUNT(*) FROM TeachingOffer
UNION ALL SELECT 'LearningRequest', COUNT(*) FROM LearningRequest
UNION ALL SELECT 'MatchTable',    COUNT(*) FROM MatchTable
UNION ALL SELECT 'Session',       COUNT(*) FROM Session
UNION ALL SELECT 'Rating',        COUNT(*) FROM Rating
UNION ALL SELECT 'Badge',         COUNT(*) FROM Badge
UNION ALL SELECT 'StudentBadge',  COUNT(*) FROM StudentBadge
UNION ALL SELECT 'Availability',  COUNT(*) FROM Availability;
