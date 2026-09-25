# 🎬 Wonderlight — Movie Reservation System

> A full-stack, production-grade cinema ticketing platform — book seats, manage theatres, and browse films with a Netflix-inspired UI.

[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.3-6DB33F?logo=spring&logoColor=white)](./backend/README.md)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-000000?logo=next.js&logoColor=white)](./frontend/README.md)
[![Language](https://img.shields.io/badge/Language-Java%2021%20%7C%20TypeScript-blue)](#-tech-stack)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?logo=postgresql&logoColor=white)](#-tech-stack)
[![Auth](https://img.shields.io/badge/Auth-JWT-orange)](#-authentication--roles)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](#)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Authentication & Roles](#-authentication--roles)
- [Key Features](#-key-features)
- [API Overview](#-api-overview)
- [Documentation](#-documentation)

---

## 🌟 Overview

**Wonderlight** is a complete movie reservation system with:

- 🔐 **JWT-based authentication** with role-based access control (User, Theatre Admin, Super Admin)
- 🎥 **TMDB-integrated movie catalog** with posters, genres, and director metadata
- 🪑 **Interactive seat maps** with real-time concurrency safety (ReentrantLock)
- 🖥️ **Cinematic UI** — hero billboards, animated seat grids, and a glassmorphic admin dashboard
- 🐳 **Docker-ready** — one `docker-compose up` starts everything in production mode

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                     Client Browser                     │
│            Next.js 14 App Router (port 3000)           │
│   Zustand · React Query · Framer Motion · Tailwind CSS │
└───────────────────────┬────────────────────────────────┘
                        │  HTTP / REST (JWT Bearer)
┌───────────────────────▼────────────────────────────────┐
│              Spring Boot 3.3 API (port 8080)           │
│         Spring Security · JWTFilter · JPA / Hibernate  │
└───────────────────────┬────────────────────────────────┘
                        │  JDBC
┌───────────────────────▼────────────────────────────────┐
│          PostgreSQL 16 (prod) / H2 (dev)               │
└────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer          | Technology                                              |
|----------------|---------------------------------------------------------|
| **Frontend**   | Next.js 14, TypeScript, Tailwind CSS, Framer Motion     |
| **Backend**    | Spring Boot 3.3, Java 21, Spring Security               |
| **Auth**       | JWT (jjwt 0.12.6) — 15-min access tokens               |
| **Database**   | PostgreSQL 16 (prod) · H2 in-memory (dev)               |
| **ORM**        | Spring Data JPA / Hibernate                             |
| **State**      | Zustand (client) · TanStack React Query (server)        |
| **Build**      | Maven (backend) · npm (frontend)                        |
| **Container**  | Docker + Docker Compose                                 |
| **Testing**    | JUnit 5 · Mockito · MockMvc (backend)                  |

---

## 📁 Project Structure

```
red-cine/
├── backend/          # Spring Boot REST API
│   ├── src/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pom.xml
│   └── README.md     ← Backend deep-dive
│
├── frontend/         # Next.js 14 App Router
│   ├── src/
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── README.md     ← Frontend deep-dive
│
└── README.md         ← You are here
```

---

## 🚀 Quick Start

### Prerequisites

| Tool        | Version     |
|-------------|-------------|
| Java        | 21+         |
| Maven       | 3.9+        |
| Node.js     | 18+         |
| Docker      | 24+ (optional, for PostgreSQL) |

### 1 — Start the Backend

```bash
cd backend

# Dev mode (H2 in-memory, no Docker needed)
./mvnw spring-boot:run
# API → http://localhost:8080
# H2 console → http://localhost:8080/h2-console

# OR Production mode (PostgreSQL via Docker)
cp .env.example .env     # fill in secrets
docker-compose up --build
```

### 2 — Start the Frontend

```bash
cd frontend

npm install

# Copy environment config
cp .env.local.example .env.local
# Set: NEXT_PUBLIC_API_URL=http://localhost:8080

npm run dev
# App → http://localhost:3000
```

### Default Super-Admin Credentials (dev)

| Field    | Value                      |
|----------|----------------------------|
| Username | `superAdmin`               |
| Password | `superPassword@123`        |
| Email    | `superadmin@redcinema.com` |

---

## 🔐 Authentication & Roles

The backend issues a **signed JWT** on login/signup. The frontend stores it in a secure HTTP-only cookie (`rc_token`) and attaches it as a Bearer token on every API call via an Axios interceptor.

| Role                 | Capabilities                                         |
|----------------------|------------------------------------------------------|
| `ROLE_USER`          | Browse movies, book & cancel own reservations        |
| `ROLE_THEATRE_ADMIN` | All of USER + manage shows for their assigned theatre|
| `ROLE_SUPER_ADMIN`   | Full CRUD — movies, theatres, users, shows           |

Next.js Middleware (`src/middleware.ts`) enforces role-based routing **before** any page renders.

---

## ⚡ Key Features

### 🎥 Movie Browsing
- Auto-rotating **Hero Billboard** (5 featured films, 8 s interval)
- Horizontal scroll rows with drag support and fade-out edges
- Movie card hover expansion — synopsis, genre pills, and a booking CTA

### 🪑 Seat Booking
- Interactive seat grid grouped by row (SINGLE / COUPLE / SOFA types)
- Live availability from `ShowSeat.seatStatus`
- **ReentrantLock** on the server prevents race-condition double-booking
- Floating Framer Motion cart with real-time total; graceful 409 toast on conflict

### 🔑 Admin Dashboards
- **Super Admin** — movie & theatre CRUD, revenue stats, user management
- **Theatre Admin** — show scheduling for their assigned venue

### 🎬 TMDB Integration
- Auto-fills director, genres, and poster when creating/updating a movie

---

## 📡 API Overview

| Resource       | Public Endpoints                    | Protected Endpoints                          |
|----------------|-------------------------------------|----------------------------------------------|
| Auth           | `POST /auth/login`, `/auth/signup`  | —                                            |
| Movies         | `GET /api/movies/all`, `…/{id}`     | `POST / PUT / DELETE` (SUPER_ADMIN)          |
| Theatres       | `GET /api/theatres/all`, `…/{id}`   | `POST / PUT / DELETE / admin` (role-guarded) |
| Shows          | `GET /api/shows/**`                 | `POST / PUT / DELETE` (THEATRE_ADMIN+)       |
| Reservations   | —                                   | `POST reserve`, `PUT cancel` (USER+)         |
| Users          | —                                   | Full CRUD (SUPER_ADMIN only)                 |

---

## 📚 Documentation

For deeper technical details, see the individual READMEs:

| Directory   | README                                      | What's inside                                              |
|-------------|---------------------------------------------|------------------------------------------------------------|
| `backend/`  | [📄 Backend README](./backend/README.md)   | API reference, auth flow, concurrency model, Docker setup, test coverage |
| `frontend/` | [📄 Frontend README](./frontend/README.md) | Design system, component map, state management, environment config        |

---

> Built with ❤️ using Spring Boot & Next.js · © 2026 Wonderlight
