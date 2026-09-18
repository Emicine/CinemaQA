# 🎬 Red Cinema — Frontend

A premium, cinematic movie reservation system frontend built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. Designed around the **Red Cinema** design system and wired to the Spring Boot backend.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local → set NEXT_PUBLIC_API_URL=http://localhost:8080

# 3. Start the backend (Spring Boot) on port 8080

# 4. Run the frontend
npm run dev
# → http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout + Providers + Navbar + Toaster
│   ├── page.tsx                  # Home page (Hero + Movie rows)
│   ├── providers.tsx             # React Query provider
│   ├── movies/[movieId]/
│   │   ├── page.tsx              # Movie detail + show selection
│   │   └── shows/[showId]/seats/
│   │       └── page.tsx          # Seat map + booking cart
│   ├── admin/page.tsx            # Super Admin dashboard
│   ├── theatre-admin/page.tsx    # Theatre Admin dashboard
│   └── globals.css               # Red Cinema base styles
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Fixed nav, scroll effect, search, profile dropdown
│   │   └── AuthModal.tsx         # Login/Signup modal with floating labels
│   ├── home/
│   │   └── HeroBillboard.tsx     # Auto-rotating hero with Framer Motion
│   ├── movies/
│   │   ├── MovieCard.tsx         # Poster card with hover expansion
│   │   ├── MovieRow.tsx          # Horizontal scroll row with drag support
│   │   └── ShowSelector.tsx      # Date chips + theatre groups + showtimes
│   └── seats/
│       └── SeatMap.tsx           # Interactive seat grid + floating cart
│
├── services/
│   ├── authService.ts            # login, signup, decodeToken, getRoleFromToken
│   ├── movieService.ts           # CRUD for movies
│   └── index.ts                  # showService, theatreService, reservationService, userService
│
├── lib/
│   └── axios.ts                  # Axios instance + JWT Bearer interceptor + 401/403 handling
│
├── store/
│   └── index.ts                  # Zustand: useAuthStore, useBookingStore, useUIStore
│
├── hooks/
│   └── index.ts                  # useMovies, useShow, useCreateReservation, useBookingSubmit…
│
├── types/
│   └── index.ts                  # All entity + DTO + state TypeScript types
│
└── middleware.ts                 # Next.js route protection (JWT cookie check)
```

---

## 🎨 Design System — Red Cinema

| Token            | Value     | Usage                             |
|------------------|-----------|-----------------------------------|
| Primary          | `#E50914` | CTAs, logo, featured badges       |
| Primary Hover    | `#C11119` | Button hover state                |
| Background       | `#141414` | Page background                   |
| Surface          | `#1F1F1F` | Cards, modals, elevated panels    |
| Text Primary     | `#FFFFFF` | Titles, headlines                 |
| Text Secondary   | `#999999` | Metadata, descriptions            |
| Border           | `#333333` | Dividers, input outlines          |
| Success          | `#46D369` | Available seats, confirmations    |
| Warning          | `#E6B616` | Filling fast badges               |

**Fonts**: Bebas Neue (display), Inter (body), JetBrains Mono (code)

---

## 🔐 Authentication & Roles

The backend issues a **JWT** (15-minute expiry) via:
- `POST /auth/login` → `{ authenticationToken }`
- `POST /auth/signup` → `{ authenticationToken }`

The token is stored in a **secure cookie** (`rc_token`). The Axios interceptor reads it and attaches `Authorization: Bearer <token>` to every request.

| Role                  | Access                                   |
|-----------------------|------------------------------------------|
| `ROLE_USER`           | Browse, book, cancel own reservations    |
| `ROLE_THEATRE_ADMIN`  | Manage shows for assigned theatre        |
| `ROLE_SUPER_ADMIN`    | Full CRUD — movies, theatres, users      |

**Next.js Middleware** (`src/middleware.ts`) enforces role-based access at the routing level by reading the JWT cookie and checking the `ROLES` claim.

---

## ⚡ Key Features

### Home Page
- Auto-rotating **Hero Billboard** (5 featured movies, 8s interval)
- **Horizontal scroll rows** with Framer Motion drag support and fade edges
- **Movie card hover expansion** — reveals synopsis, genre pills, and booking CTA after 300ms

### Movie Detail & Show Selection
- Full metadata display (duration, genre, director, rating)
- **14-day date picker** with `date-fns`
- Theatre groups filtered by location
- "Filling Fast" badges for prime-time slots (6–9 PM)

### Interactive Seat Map
- Grid grouped by `rowId`, sorted by `seatNumber`
- 4 seat types visually distinguished (SINGLE, COUPLE, SINGLE_SOFA, COUPLE_SOFA)
- `AVAILABLE` / `BOOKED` state from `ShowSeat.seatStatus`
- **Floating booking cart** (Framer Motion slide-up) with real-time total
- Handles backend **409 Conflict** (ReentrantLock) with a friendly toast

### Admin Dashboard
- Live stats cards (revenue, bookings, movies, theatres)
- Full CRUD tables for Movies and Theatres
- Delete with optimistic invalidation via React Query

---

## 🛠 Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | Next.js 14 App Router               |
| Language     | TypeScript                          |
| Styling      | Tailwind CSS + custom CSS variables |
| Animation    | Framer Motion                       |
| HTTP Client  | Axios + interceptors                |
| State        | Zustand (auth + booking + UI)       |
| Server State | TanStack React Query v5             |
| Date Utils   | date-fns                            |
| Icons        | Lucide React                        |
| Toasts       | react-hot-toast                     |
| Cookies      | js-cookie                           |

---

## 🔌 Backend API Map

| Frontend Action            | Backend Endpoint                                 |
|----------------------------|--------------------------------------------------|
| Login                      | `POST /auth/login`                               |
| Signup                     | `POST /auth/signup`                              |
| List movies                | `GET /api/movies/all?page=0&pageSize=12`         |
| Movie detail               | `GET /api/movies/movie/{movieId}`                |
| Shows for a movie          | `GET /api/shows/movie/{movieId}`                 |
| Show detail (+ showSeats)  | `GET /api/shows/show/{showId}`                   |
| Create reservation         | `POST /api/reservations/reserve`                 |
| Cancel reservation         | `PUT /api/reservations/cancel/{reservationId}`   |
| All theatres               | `GET /api/theatres/all`                          |
| All movies (admin)         | `GET /api/movies/all?page=0&pageSize=50`         |
| Delete movie               | `DELETE /api/movies/movie/{movieId}`             |
| Delete theatre             | `DELETE /api/theatres/theatre/{theatreId}`       |
| Assign theatre admin       | `POST /api/theatres/theatre/admin`               |

---

## 🧩 Extending

### Add a new page
```tsx
// src/app/my-page/page.tsx
export default function MyPage() {
  return <main className="pt-[68px]">...</main>;
}
```

### Add a new service call
```ts
// src/services/myService.ts
import api from "@/lib/axios";
export const myService = {
  async doSomething() {
    const r = await api.get("/api/something");
    return r.data;
  }
};
```

### Add a protected route
```ts
// src/middleware.ts — add to the relevant array
const PROTECTED_ROUTES = ["/my-new-protected-route", ...];
```
