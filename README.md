# 🎓 Peerly — Peer Tutoring Marketplace

> A full-stack web platform where students connect as tutors and learners, book sessions, rate each other, and earn badges — all backed by a relational database with triggers, reputation scoring, and audit logging.

**Live Demo →** [peerly-dbs-project-1-production.up.railway.app](https://peerly-dbs-project-1-production.up.railway.app/login)
`alice@mail.com` / `password123` (demo account)

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
<img width="1751" height="655" alt="dbms_back0" src="https://github.com/user-attachments/assets/f0809042-234e-40aa-87de-58da85cf4089" />
<img width="1758" height="697" alt="dbms_back1" src="https://github.com/user-attachments/assets/148623e6-b5af-49d5-aa09-902c8bc0315b" />
<img width="1743" height="691" alt="dbms_back2" src="https://github.com/user-attachments/assets/8552db7f-d47e-48cb-82b7-e72cb4664803" />

<img width="953" height="473" alt="dbms_front0" src="https://github.com/user-attachments/assets/2bd9e03e-ba08-478a-a9b1-036545a389d3" />
<img width="955" height="441" alt="dbms_front1" src="https://github.com/user-attachments/assets/0868eff0-3cf7-475f-aca6-d2c20b6ad717" />
<img width="954" height="438" alt="dbms_front2" src="https://github.com/user-attachments/assets/d84baeff-f4e8-418c-8cfc-67abed0a7b3d" />
<img width="952" height="447" alt="dbms_front3" src="https://github.com/user-attachments/assets/983c6f26-664c-4ac7-b846-db24668c0f0c" />



