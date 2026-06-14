import { createServerFn } from '@tanstack/react-start'
import { getPool } from '@/lib/db'
import type { RowDataPacket } from 'mysql2'

// --- Types matching mockDb.ts shapes ---
export type ActiveTutor = {
  offer_id: number; student_id: number; student_name: string;
  department: string; year: number; subject_id: number;
  subject_name: string; category: string; difficulty: string;
  rate: 'Free' | 'Paid'; max_students: number;
  reputation_score: number; avg_rating: number; total_ratings: number;
}

export type SessionHistoryRow = {
  session_id: number; datetime: string; duration: number;
  mode: string; status: string; subject_name: string;
  tutor: { student_id: number; name: string; department: string; email: string };
  learner: { student_id: number; name: string; department: string; email: string };
  given_rating?: number; received_rating?: number;
}

export type StudentRep = {
  student: { student_id: number; name: string; department: string; year: number; email: string };
  reputation_score: number; avg_rating: number; total_ratings: number;
  completed_sessions: number; badge_count: number;
  dept_rank: number; dept_total: number;
  badges: { badge_name: string; criteria: string; awarded_at: string }[];
}

export const getActiveTutorsFn = createServerFn({ method: 'GET' })
  .handler(async (): Promise<ActiveTutor[]> => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT o.offer_id, s.student_id, s.name AS student_name,
             d.code AS department, s.year,
             sub.subject_id, sub.name AS subject_name,
             sub.category, sub.difficulty_level AS difficulty,
             o.rate_type AS rate, o.max_students, s.reputation_score,
             COALESCE(AVG(r.score), s.reputation_score) AS avg_rating,
             COUNT(r.rating_id) AS total_ratings
      FROM TeachingOffer o
      JOIN Student s ON s.student_id = o.student_id
      JOIN Department d ON d.dept_id = s.dept_id
      JOIN Subject sub ON sub.subject_id = o.subject_id
      LEFT JOIN Rating r ON r.ratee_id = s.student_id
      WHERE o.is_active = TRUE
      GROUP BY o.offer_id, s.student_id, s.name, d.code, s.year,
               sub.subject_id, sub.name, sub.category, sub.difficulty_level,
               o.rate_type, o.max_students, s.reputation_score
    `)
    return rows as unknown as ActiveTutor[]
  })

export const getMatchFeedFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { studentId: number })
  .handler(async ({ data }): Promise<ActiveTutor[]> => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT o.offer_id, s.student_id, s.name AS student_name,
             d.code AS department, s.year,
             sub.subject_id, sub.name AS subject_name,
             sub.category, sub.difficulty_level AS difficulty,
             o.rate_type AS rate, o.max_students, s.reputation_score,
             COALESCE(AVG(r.score), s.reputation_score) AS avg_rating,
             COUNT(r.rating_id) AS total_ratings
      FROM TeachingOffer o
      JOIN Student s ON s.student_id = o.student_id
      JOIN Department d ON d.dept_id = s.dept_id
      JOIN Subject sub ON sub.subject_id = o.subject_id
      LEFT JOIN Rating r ON r.ratee_id = s.student_id
      WHERE o.is_active = TRUE
        AND sub.subject_id IN (
          SELECT subject_id FROM LearningRequest WHERE student_id = ? AND is_active = TRUE
        )
        AND o.student_id != ?
      GROUP BY o.offer_id, s.student_id, s.name, d.code, s.year,
               sub.subject_id, sub.name, sub.category, sub.difficulty_level,
               o.rate_type, o.max_students, s.reputation_score
    `, [data.studentId, data.studentId])
    return rows as unknown as ActiveTutor[]
  })

export const getStudentByIdFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { id: number })
  .handler(async ({ data }) => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT s.student_id, s.name, s.email, s.year,
             d.code AS department, s.reputation_score
      FROM Student s
      JOIN Department d ON d.dept_id = s.dept_id
      WHERE s.student_id = ?
    `, [data.id])
    return (rows[0] ?? null) as { student_id: number; name: string; email: string; year: number; department: string; reputation_score: number } | null
  })

export const getTeachingSubjectsFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { studentId: number })
  .handler(async ({ data }) => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT sub.subject_id, sub.name, sub.category, sub.difficulty_level AS difficulty_level
      FROM TeachingOffer o
      JOIN Subject sub ON sub.subject_id = o.subject_id
      WHERE o.student_id = ? AND o.is_active = TRUE
    `, [data.studentId])
    return rows as unknown as { subject_id: number; name: string; category: string; difficulty_level: string }[]
  })

export const getLearningSubjectsFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { studentId: number })
  .handler(async ({ data }) => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT sub.subject_id, sub.name, sub.category, sub.difficulty_level AS difficulty_level
      FROM LearningRequest lr
      JOIN Subject sub ON sub.subject_id = lr.subject_id
      WHERE lr.student_id = ? AND lr.is_active = TRUE
    `, [data.studentId])
    return rows as unknown as { subject_id: number; name: string; category: string; difficulty_level: string }[]
  })

export const getRatingsForFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { studentId: number })
  .handler(async ({ data }) => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT r.rating_id, r.session_id, r.rater_id, r.ratee_id, r.score, r.comment,
             s.name AS rater_name, s.email AS rater_email, d.code AS rater_department
      FROM Rating r
      JOIN Student s ON s.student_id = r.rater_id
      JOIN Department d ON d.dept_id = s.dept_id
      WHERE r.ratee_id = ?
      ORDER BY r.rated_at ASC
    `, [data.studentId])
    return (rows as any[]).map(r => ({
      rating_id: r.rating_id,
      session_id: r.session_id,
      rater_id: r.rater_id,
      ratee_id: r.ratee_id,
      score: r.score,
      comment: r.comment ?? '',
      rater: { student_id: r.rater_id, name: r.rater_name, department: r.rater_department, email: r.rater_email },
    }))
  })

export const getStudentReputationFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { studentId: number })
  .handler(async ({ data }): Promise<StudentRep> => {
    // Student info
    const [sRows] = await getPool().execute<RowDataPacket[]>(`
      SELECT s.student_id, s.name, s.email, s.year, s.reputation_score, d.code AS department
      FROM Student s JOIN Department d ON d.dept_id = s.dept_id
      WHERE s.student_id = ?
    `, [data.studentId])
    const student = sRows[0] as any

    // Ratings received
    const [rRows] = await getPool().execute<RowDataPacket[]>(`
      SELECT AVG(score) AS avg_rating, COUNT(*) AS total_ratings
      FROM Rating WHERE ratee_id = ?
    `, [data.studentId])
    const rData = rRows[0] as any

    // Completed sessions as tutor
    const [cRows] = await getPool().execute<RowDataPacket[]>(`
      SELECT COUNT(*) AS completed_sessions
      FROM Session sess
      JOIN MatchTable m ON m.match_id = sess.match_id
      JOIN TeachingOffer o ON o.offer_id = m.offer_id
      WHERE o.student_id = ? AND sess.status = 'Completed'
    `, [data.studentId])
    const cData = cRows[0] as any

    // Badges
    const [bRows] = await getPool().execute<RowDataPacket[]>(`
      SELECT b.badge_name, b.criteria, sb.awarded_at
      FROM StudentBadge sb JOIN Badge b ON b.badge_id = sb.badge_id
      WHERE sb.student_id = ?
    `, [data.studentId])

    // Dept rank
    const [dRankRows] = await getPool().execute<RowDataPacket[]>(`
      SELECT s2.student_id,
             RANK() OVER (PARTITION BY s2.dept_id ORDER BY s2.reputation_score DESC) AS dept_rank,
             COUNT(*) OVER (PARTITION BY s2.dept_id) AS dept_total
      FROM Student s2 WHERE s2.dept_id = (SELECT dept_id FROM Student WHERE student_id = ?)
    `, [data.studentId])
    const myRank = (dRankRows as any[]).find(r => r.student_id === data.studentId)

    return {
      student: { student_id: student.student_id, name: student.name, email: student.email, year: student.year, department: student.department },
      reputation_score: Number(student.reputation_score),
      avg_rating: rData.avg_rating ? Math.round(Number(rData.avg_rating) * 10) / 10 : Number(student.reputation_score),
      total_ratings: Number(rData.total_ratings ?? 0),
      completed_sessions: Number(cData.completed_sessions ?? 0),
      badge_count: (bRows as any[]).length,
      dept_rank: myRank ? Number(myRank.dept_rank) : 1,
      dept_total: myRank ? Number(myRank.dept_total) : 1,
      badges: (bRows as any[]).map(b => ({ badge_name: b.badge_name, criteria: b.criteria, awarded_at: String(b.awarded_at) })),
    }
  })

export const getSessionHistoryFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { studentId: number })
  .handler(async ({ data }): Promise<SessionHistoryRow[]> => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT sess.session_id, sess.datetime, sess.duration, sess.mode, sess.status,
             sub.name AS subject_name,
             tutor.student_id AS tutor_id, tutor.name AS tutor_name, dt.code AS tutor_dept, tutor.email AS tutor_email,
             learner.student_id AS learner_id, learner.name AS learner_name, dl.code AS learner_dept, learner.email AS learner_email
      FROM Session sess
      JOIN MatchTable m ON m.match_id = sess.match_id
      JOIN TeachingOffer o ON o.offer_id = m.offer_id
      JOIN LearningRequest req ON req.request_id = m.request_id
      JOIN Student tutor ON tutor.student_id = o.student_id
      JOIN Department dt ON dt.dept_id = tutor.dept_id
      JOIN Student learner ON learner.student_id = req.student_id
      JOIN Department dl ON dl.dept_id = learner.dept_id
      JOIN Subject sub ON sub.subject_id = o.subject_id
      WHERE tutor.student_id = ? OR learner.student_id = ?
      ORDER BY sess.datetime DESC
    `, [data.studentId, data.studentId])

    // Attach given/received ratings per session
    const sessionIds = (rows as any[]).map(r => r.session_id)
    let givenMap: Record<number, number> = {}
    let receivedMap: Record<number, number> = {}
    if (sessionIds.length) {
      const placeholders = sessionIds.map(() => '?').join(',')
      const [rRows] = await getPool().execute<RowDataPacket[]>(`
        SELECT session_id, rater_id, ratee_id, score FROM Rating
        WHERE session_id IN (${placeholders})
      `, sessionIds)
      for (const r of rRows as any[]) {
        if (r.rater_id === data.studentId) givenMap[r.session_id] = r.score
        if (r.ratee_id === data.studentId) receivedMap[r.session_id] = r.score
      }
    }

    return (rows as any[]).map(r => ({
      session_id: r.session_id,
      datetime: String(r.datetime),
      duration: r.duration,
      mode: r.mode,
      status: r.status,
      subject_name: r.subject_name,
      tutor: { student_id: r.tutor_id, name: r.tutor_name, department: r.tutor_dept, email: r.tutor_email },
      learner: { student_id: r.learner_id, name: r.learner_name, department: r.learner_dept, email: r.learner_email },
      given_rating: givenMap[r.session_id],
      received_rating: receivedMap[r.session_id],
    }))
  })

export const getOfferByIdFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { offerId: number })
  .handler(async ({ data }) => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT offer_id, student_id, subject_id, rate_type AS rate, hourly_rate, max_students
      FROM TeachingOffer WHERE offer_id = ?
    `, [data.offerId])
    return (rows[0] ?? null) as any
  })

export const getAvailabilityForFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { studentId: number })
  .handler(async ({ data }) => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT avail_id, student_id, day_of_week, start_time, end_time
      FROM Availability WHERE student_id = ?
    `, [data.studentId])
    return rows as any[]
  })

export const getSubjectByIdFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as { subjectId: number })
  .handler(async ({ data }) => {
    const [rows] = await getPool().execute<RowDataPacket[]>(`
      SELECT subject_id, name, category, difficulty_level FROM Subject WHERE subject_id = ?
    `, [data.subjectId])
    return (rows[0] ?? null) as any
  })

export const bookSessionFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as {
    offer_id: number; learner_id: number; datetime: string; duration: number; mode: string
  })
  .handler(async ({ data }) => {
    const pool = getPool()
    // Find or create a match
    const [mRows] = await pool.execute<RowDataPacket[]>(
      'SELECT match_id FROM MatchTable WHERE offer_id = ?', [data.offer_id]
    )
    let match_id: number
    if ((mRows as any[]).length) {
      match_id = (mRows as any[])[0].match_id
    } else {
      // Find a learning request for this subject from this learner
      const [reqRows] = await pool.execute<RowDataPacket[]>(`
        SELECT lr.request_id FROM LearningRequest lr
        JOIN TeachingOffer o ON o.subject_id = lr.subject_id
        WHERE o.offer_id = ? AND lr.student_id = ? AND lr.is_active = TRUE
        LIMIT 1
      `, [data.offer_id, data.learner_id])
      const request_id = (reqRows as any[])[0]?.request_id ?? null
      if (!request_id) throw new Error('No matching learning request found')
      const [ins] = await pool.execute<any>(
        'INSERT INTO MatchTable (offer_id, request_id, status) VALUES (?, ?, ?)',
        [data.offer_id, request_id, 'Accepted']
      )
      match_id = ins.insertId
    }
    const [ins] = await pool.execute<any>(
      'INSERT INTO Session (match_id, datetime, duration, mode, status) VALUES (?, ?, ?, ?, ?)',
      [match_id, data.datetime.replace('T', ' '), data.duration, data.mode, 'Scheduled']
    )
    return { session_id: ins.insertId, match_id }
  })

export const completeSessionFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as { sessionId: number })
  .handler(async ({ data }) => {
    await getPool().execute(
      "UPDATE Session SET status = 'Completed' WHERE session_id = ?",
      [data.sessionId]
    )
    return { ok: true }
  })

export const leaveRatingFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as {
    session_id: number; rater_id: number; ratee_id: number; score: number; comment: string
  })
  .handler(async ({ data }) => {
    const [ins] = await getPool().execute<any>(
      'INSERT INTO Rating (session_id, rater_id, ratee_id, score, comment) VALUES (?, ?, ?, ?, ?)',
      [data.session_id, data.rater_id, data.ratee_id, data.score, data.comment]
    )
    return { rating_id: ins.insertId }
  })
