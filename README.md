# 🎓 Peerly — Peer Tutoring Marketplace

> A full-stack web platform where students connect as tutors and learners, book sessions, rate each other, and earn badges — all backed by a relational database with triggers, reputation scoring, and audit logging.

**Live Demo →** [peerly-dbs-project-1-production.up.railway.app](https://peerly-dbs-project-1-production.up.railway.app/login)
`alice@mail.com` / `password123` (demo account)

---

## 📌 Project Overview

Peerly is an academic database systems project built at **BITS Pilani, Dubai Campus** as part of the Database Management Systems course. It demonstrates real-world application of relational database design, query optimization, and backend integration.

Students can register as **tutors** (offering subjects they excel at) or **learners** (requesting help in subjects they need). The system intelligently matches them, lets them book sessions, collects ratings, and automatically awards badges via database triggers when milestones are reached.

---

## ✨ Features

- 🔐 Student registration, login, and profile management
- 📋 Teaching Offers (subject, rate, availability) and Learning Requests (subject, urgency)
- 🤝 Automatic matching of learners to compatible tutors
- 📅 Session booking with date, time, duration, and mode (online/offline)
- ⭐ Mutual post-session ratings (1–5 stars + optional comments)
- 📊 Reputation score computed as a weighted average of ratings, recency, and session count
- 🏅 Badge auto-award via **database trigger** when a tutor completes 10+ sessions
- 🗓️ Weekly availability block scheduling
- 📝 Private per-student SessionNotes for tutors
- 🔍 ReputationLog audit trail for every score change
---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI Components | shadcn/ui + Tailwind CSS |
| Package Manager | Bun |
| Database | PostgreSQL (Railway) |
| Deployment | Railway |
| Code Quality | ESLint + Prettier |

---

## 🗂️ Database Design

The schema was designed from scratch with careful attention to normalization, relationship modeling, and constraint enforcement.

**Core entities:**
- `Student` — user profiles with roles (tutor/learner/both)
- `TeachingOffer` — subjects a tutor is offering with rate and availability
- `LearningRequest` — subjects a learner needs help in, with urgency
- `Match` — links a LearningRequest to a compatible TeachingOffer
- `Session` — a booked tutoring session (date, time, duration, mode)
- `Rating` — post-session mutual reviews
- `Badge` — milestone-based achievements (auto-awarded via trigger)
- `Availability` — weekly time blocks per student
- `SessionNote` — private tutor notes per student
- `ReputationLog` — full audit trail of reputation score changes

**Key design decisions:**
- Reputation score is a computed weighted average (rating value × recency weight × session count factor), recalculated after every new rating
- A `BEFORE INSERT` trigger on the `Rating` table fires badge assignment when a tutor's completed session count crosses 10
- The `ReputationLog` ensures full transparency and auditability of every score change

---

## 👩‍💻 My Contributions

This project was built collaboratively. My specific contributions were:

**1. ER Framework Design**
- Identified all core entities and their attributes from the requirements
- Defined attribute types, primary keys, and constraints for each entity
- Modelled all relationships including cardinalities (one-to-many, many-to-many) and participation constraints
- Translated the ER diagram into a normalized relational schema

**2. Front-End to Back-End Connectivity**
- Integrated the React frontend with the PostgreSQL backend hosted on Railway
- Configured environment variables and connection strings for Railway deployment
- Ensured API calls correctly map to database operations (CRUD for sessions, offers, requests, ratings)

---

## 🚀 Getting Started (Local Setup)

```bash
# Clone the repo
git clone https://github.com/Harini-V06/peerly-dbs-project-1-.git
cd peerly-dbs-project-1-

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Add your PostgreSQL connection string from Railway

# Run the dev server
bun run dev
```

The app will be live at `http://localhost:5173`.

---

## 🗄️ Database Setup

The `sql/` folder contains the full schema and seed data.

```bash
# Connect to your PostgreSQL instance and run:
psql -U <user> -d <database> -f sql/schema.sql
```

---

---

## 📸 Screenshots


