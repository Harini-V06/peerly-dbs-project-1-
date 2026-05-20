# Peer Tutoring Marketplace — Person 4 MVP

A frontend MVP that displays tutors, books sessions, and shows ratings/reputation/badges, plus the SQL backend pieces Person 4 owns (triggers + views) layered on top of Person 3's schema.

> Note on stack: the request says "HTML/CSS/JS". The Lovable preview runs a React (TanStack Start) project, so I'll build the UI as React components (still just JSX/CSS/JS — no backend framework) using mock seed data that mirrors Person 3's schema exactly. The SQL files will live alongside as deliverables you can submit. If you'd rather have pure static `.html/.css/.js` files in `/public` instead, say the word and I'll switch.

## Design direction
Pulling from the Pretty Little Marketer reference:
- Cream/off-white background, soft pink accent cards, pastel blue secondary, black serif display headings, sans-serif body
- Rounded "pill" buttons with pink fill, hand-cut sticker-style tags
- Grid of card sections, marquee divider strip, profile cards with circular avatars
- Adapted for a study/tutoring context (graduation cap motif, subject tags instead of marketing tags)

## Pages (routes)
1. **Home / Match Feed** (`/`) — hero + scrolling marquee + grid of tutor cards filtered by subjects you need
2. **Tutors** (`/tutors`) — full searchable list of teaching offers with subject/rate/rating filters
3. **Student Profile** (`/students/$id`) — avatar, dept/year, subjects taught & needed, reputation score, badges, recent ratings
4. **Booking** (`/book/$offerId`) — pick tutor (preselected), pick time slot from availability, choose mode (online/offline), confirm
5. **Session History** (`/sessions`) — past/upcoming sessions, ratings given/received, leave-a-rating action
6. **Reputation Dashboard** (`/reputation`) — score breakdown, badges earned, ranking within department

A shared top nav (logo, links, "Join" pill button) and footer marquee.

## Person 4 backend deliverables (SQL files in `/sql`)
- `01_triggers.sql`
  - `trg_award_expert_badge` — after Session status becomes 'Completed', auto-insert Expert badge when tutor reaches 10 completed sessions (cleaned-up version of Person 3's draft, fixes the `tutor_id` reference by joining through Match→TeachingOffer)
  - `trg_update_reputation` — after a Rating insert, recompute the ratee's `reputation_score` as a weighted avg (recent ratings weighted higher) and write the old→new delta into `ReputationLog`
- `02_views.sql`
  - `vw_active_tutors` — joins Student + TeachingOffer + Subject + avg rating
  - `vw_session_history` — joins Session + Match + both students + subject
  - `vw_student_reputation` — student + reputation + badge count + session count + dept ranking
- `03_integration_notes.md` — short doc explaining how the frontend would call each view/trigger (Person 4's "UI connection" responsibility)

## Frontend → DB mapping (mock layer)
- `src/data/mockDb.ts` — TypeScript objects mirroring the schema (Student, Subject, TeachingOffer, LearningRequest, Match, Session, Rating, Badge, StudentBadge, Availability) seeded with Person 3's INSERT data plus extra rows so the UI looks populated
- `src/data/queries.ts` — JS functions named after the SQL views (`getActiveTutors()`, `getSessionHistory(studentId)`, `getStudentReputation(studentId)`) so swapping in real SQL later is a 1:1 replacement
- Booking and rating actions update the in-memory store and trigger the JS equivalents of the badge/reputation triggers, so the gamification loop is demoable end-to-end

## File structure
```text
src/
  routes/
    index.tsx              home / match feed
    tutors.tsx
    students.$id.tsx
    book.$offerId.tsx
    sessions.tsx
    reputation.tsx
    __root.tsx             nav + footer marquee
  components/
    TutorCard.tsx
    SubjectTag.tsx
    BadgeChip.tsx
    StarRating.tsx
    Marquee.tsx
    PillButton.tsx
  data/
    mockDb.ts
    queries.ts             mirrors SQL views
    mutations.ts           mirrors triggers (badge + reputation)
  styles.css               cream/pink/black design tokens
sql/
  01_triggers.sql
  02_views.sql
  03_integration_notes.md
```

## Design tokens (added to `src/styles.css`)
- `--background`: warm cream (`oklch(0.97 0.015 85)`)
- `--primary`: PLM pink (`oklch(0.82 0.10 15)`) + pink-foreground black
- `--accent`: pastel blue (`oklch(0.88 0.06 230)`)
- `--secondary`: soft mint card (`oklch(0.92 0.05 150)`)
- `--foreground`: near-black (`oklch(0.18 0 0)`)
- Display font: Instrument Serif (headings) + Inter (body) via Google Fonts
- Radius: `1.25rem` for cards, `9999px` for pill buttons

## Out of scope (per problem statement)
Auth, payments, real-time chat, video. Mock "current user" is hard-coded as Alice (student_id 1) so the demo flows work without a login screen.
