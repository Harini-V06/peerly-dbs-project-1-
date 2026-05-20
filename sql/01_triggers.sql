-- ============================================================
-- Person 4 — Triggers
-- Owns: automation logic on top of Person 3's schema
-- ============================================================

-- ------------------------------------------------------------
-- 1. Auto-award the "Expert" badge when a tutor completes 10+
--    sessions. Fires after a Session's status changes.
--
--    Note: Person 3's draft referenced NEW.tutor_id directly,
--    but Session doesn't store a tutor_id. We resolve the tutor
--    via Match -> TeachingOffer.
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_award_expert_badge;

DELIMITER //
CREATE TRIGGER trg_award_expert_badge
AFTER UPDATE ON Session
FOR EACH ROW
BEGIN
    DECLARE v_tutor_id INT;
    DECLARE v_completed INT;

    IF NEW.status = 'Completed' AND OLD.status <> 'Completed' THEN
        -- Resolve tutor from match -> offer
        SELECT o.student_id INTO v_tutor_id
        FROM MatchTable m
        JOIN TeachingOffer o ON o.offer_id = m.offer_id
        WHERE m.match_id = NEW.match_id;

        -- Count this tutor's completed sessions
        SELECT COUNT(*) INTO v_completed
        FROM Session s
        JOIN MatchTable m ON m.match_id = s.match_id
        JOIN TeachingOffer o ON o.offer_id = m.offer_id
        WHERE o.student_id = v_tutor_id
          AND s.status = 'Completed';

        IF v_completed >= 10 THEN
            INSERT IGNORE INTO StudentBadge(student_id, badge_id)
            VALUES (v_tutor_id, 1);   -- badge_id 1 = "Expert"
        END IF;
    END IF;
END//
DELIMITER ;


-- ------------------------------------------------------------
-- 2. Auto-update Student.reputation_score after a new rating,
--    and write the old -> new delta into ReputationLog.
--
--    Score = weighted average of received ratings, where the
--    i-th rating (oldest = 1) carries weight i. Newer ratings
--    count more.
-- ------------------------------------------------------------
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

    -- Weighted average: ROW_NUMBER acts as the weight
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

    INSERT INTO ReputationLog(student_id, old_score, new_score, reason, changed_at)
    VALUES (NEW.ratee_id, v_old, v_new,
            CONCAT('Rating received: ', NEW.score, ' stars'),
            NOW());
END//
DELIMITER ;
