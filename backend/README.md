# 🎬 Red Cinema — Backend (Spring Boot)

A production-grade Movie Reservation System REST API built with Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, and PostgreSQL.

---

## 🚀 Quick Start

### Option A — Run locally with H2 (dev)
```bash
./mvnw spring-boot:run
# API available at http://localhost:8080
# H2 console at http://localhost:8080/h2-console
```

### Option B — Docker Compose (PostgreSQL + API)
```bash
cp .env.example .env          # fill in your secrets
docker-compose up --build
# API available at http://localhost:8080
```

### Default super-admin credentials (dev)
| Field    | Value                   |
|----------|-------------------------|
| Username | `superAdmin`            |
| Password | `superPassword@123`     |
| Email    | `superadmin@redcinema.com` |

---

## 📁 Project Structure

```
src/main/java/com/redcinema/mrs/
├── config/
│   └── SecurityConfig.java          # CORS, JWT filter chain, method security
├── constants/
│   └── ExceptionConstants.java      # All error message strings
├── controller/
│   ├── advice/
│   │   └── GlobalExceptionHandler.java
│   ├── AuthenticationController.java
│   ├── MovieController.java
│   ├── ReservationController.java
│   ├── ShowController.java
│   ├── TheatreController.java
│   └── UserController.java
├── dto/                             # Request + Response DTOs (with @Valid)
├── entity/                          # JPA entities
├── enums/                           # UserRole, Genre, SeatType, SeatStatus, ReservationStatus
├── exception/                       # Custom exceptions (all extend CustomException)
├── filter/
│   └── JWTFilter.java               # OncePerRequestFilter — validates JWT
├── lock/
│   └── SeatLock.java                # ReentrantLock registry for concurrent booking
├── repository/                      # Spring Data JPA repositories
├── seeder/
│   └── SuperAdminSeeder.java        # Idempotent ApplicationRunner
├── service/
│   ├── auth/
│   │   ├── AppUserDetailsService.java
│   │   ├── AuthenticationService.java
│   │   └── JWTService.java
│   ├── MovieService.java
│   ├── ReservationService.java
│   ├── ScreenService.java
│   ├── SeatService.java
│   ├── ShowSeatService.java
│   ├── ShowService.java
│   ├── TheatreService.java
│   └── UserService.java
├── validation/
│   └── UserRoleValidationService.java  # SpEL bean for @PreAuthorize
└── MrsApplication.java
```

---

## 🔐 Authentication & Authorization

### Token Flow
```
POST /auth/signup  →  Creates user + returns JWT
POST /auth/login   →  Validates credentials + returns JWT
```

All protected endpoints require:
```
Authorization: Bearer <token>
```

### Role Hierarchy

| Role | Capabilities |
|------|-------------|
| `ROLE_USER` | Browse, book tickets, cancel own reservations |
| `ROLE_THEATRE_ADMIN` | All of ROLE_USER + manage shows for assigned theatre |
| `ROLE_SUPER_ADMIN` | Full CRUD on movies, theatres, users, shows |

### Method-Level Security

| Annotation | Used for |
|-----------|----------|
| `@Secured("ROLE_SUPER_ADMIN")` | Simple role-only checks |
| `@PreAuthorize("@userRoleValidationService.isUser...")` | Context-aware checks (e.g. is this user an admin of *this* theatre?) |

---

## 📡 API Reference

### Authentication
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/auth/signup` | None | Register new user |
| POST | `/auth/login` | None | Login and get JWT |

### Movies (public read, SUPER_ADMIN write)
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/movies/all?page=0&pageSize=10` | None | Paginated list |
| GET | `/api/movies/movie/{id}` | None | Get by ID |
| POST | `/api/movies/movie/create` | SUPER_ADMIN | Create movie |
| PUT | `/api/movies/movie/{id}` | SUPER_ADMIN | Update movie |
| DELETE | `/api/movies/movie/{id}` | SUPER_ADMIN | Delete movie |

### Theatres (public read, role-guarded write)
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/theatres/all?page=0&pageSize=10` | None | Paginated list |
| GET | `/api/theatres/theatre/{id}` | None | Get by ID |
| POST | `/api/theatres/theatre/create` | SUPER_ADMIN | Create theatre |
| PUT | `/api/theatres/theatre/{id}` | SUPER_ADMIN / THEATRE_ADMIN | Update theatre |
| DELETE | `/api/theatres/theatre/{id}` | SUPER_ADMIN / THEATRE_ADMIN | Delete theatre |
| POST | `/api/theatres/theatre/admin` | SUPER_ADMIN / THEATRE_ADMIN | Assign admin |
| DELETE | `/api/theatres/theatre/admin` | SUPER_ADMIN / THEATRE_ADMIN | Remove admin |

### Shows (public read, role-guarded write)
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/shows/all` | None | Paginated list |
| GET | `/api/shows/show/{id}` | None | Get show + showSeats |
| GET | `/api/shows/movie/{movieId}` | None | Shows for a movie |
| GET | `/api/shows/theatre/{theatreId}` | None | Shows for a theatre |
| GET | `/api/shows/screen/{screenId}` | None | Shows for a screen |
| POST | `/api/shows/show/create` | SUPER_ADMIN / THEATRE_ADMIN | Create show |
| PUT | `/api/shows/show/{id}` | SUPER_ADMIN / THEATRE_ADMIN | Update show |
| DELETE | `/api/shows/show/{id}` | SUPER_ADMIN / THEATRE_ADMIN | Delete show |

### Reservations
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/reservations/user/{userId}/all` | Authenticated | User's bookings |
| POST | `/api/reservations/reserve` | ROLE_USER | Book seats |
| PUT | `/api/reservations/cancel/{id}` | Owner / SUPER_ADMIN | Cancel booking |

### Users (SUPER_ADMIN only)
| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/users/all` | SUPER_ADMIN | Paginated list |
| GET | `/api/users/user/{id}` | SUPER_ADMIN | Get user |
| POST | `/api/users/user/create` | SUPER_ADMIN | Create user |
| PUT | `/api/users/user/{id}` | SUPER_ADMIN | Update user |
| DELETE | `/api/users/user/{id}` | SUPER_ADMIN | Delete user |

---

## 🎯 Booking Flow (Concurrency)

The booking flow uses `ReentrantLock` to prevent double-booking when multiple users try to book the same seat simultaneously:

```
1. POST /api/reservations/reserve
2. SeatLock.tryLockAll(showSeatIds)   → 409 CONFLICT if any seat is already locked
3. DB availability check              → 409 if seats marked BOOKED since lock
4. Mark seats BOOKED + compute total
5. Persist Reservation
6. Update Theatre.totalRevenue / totalBookings
7. SeatLock.releaseAll()              ← always in finally block
```

On a 409 response, the frontend should prompt the user to reselect their seats.

---

## 🐛 Bug Fixes from Original Code

| # | Location | Bug | Fix |
|---|----------|-----|-----|
| 1 | `UserController.getUserById()` | `firstName` was set from `getUserEmail()` | Changed to `getFirstName()` |
| 2 | `TheatreService.createNewTheatre()` | `theatreLocation` was set from `theatreName` | Now correctly uses `dto.getTheatreLocation()` |
| 3 | `ReservationService.cancelReservation()` | `totalBookings` was *added* to on cancel | Now correctly *subtracts* seat count |
| 4 | `UserService.createNewUser()` | Password stored plaintext via admin create path | Admin create path now BCrypt-encodes |
| 5 | `TheatreController.deleteTheatreById()` | Path variable named `userId` instead of `theatreId` | Renamed to `theatreId` |
| 6 | `SuperAdminSeeder` | Used `ContextRefreshedEvent` — re-seeded on every test context | Switched to `ApplicationRunner` + existence check |
| 7 | `JWTFilter` | No token validity check before trusting it | Added `jwtService.isTokenValid()` guard |
| 8 | `SeatLock` | No rollback if partial lock acquisition failed | `tryLockAll` rolls back any acquired locks before returning `false` |

---

## ⚙️ Configuration

### Environment Variables (production)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/mrs` | JDBC URL |
| `DATABASE_USER` | `mrs` | DB username |
| `DATABASE_PASSWORD` | `secret` | DB password |
| `JWT_EXPIRY_MINUTES` | `60` | Token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `SUPER_ADMIN_USERNAME` | `superAdmin` | Bootstrap admin username |
| `SUPER_ADMIN_PASSWORD` | `superPassword@123` | Bootstrap admin password |
| `SUPER_ADMIN_EMAIL` | `superadmin@redcinema.com` | Bootstrap admin email |

---

## 🧪 Tests

```bash
# All tests
./mvnw test

# Specific test class
./mvnw test -Dtest=ReservationServiceTest

# With coverage report
./mvnw verify
```

### Test Coverage

| Test Class | Type | Tests |
|-----------|------|-------|
| `UserServiceTest` | Unit | 8 |
| `MovieServiceTest` | Unit | 7 |
| `ReservationServiceTest` | Unit | 6 (bug-fix verification) |
| `TheatreServiceTest` | Unit | 7 |
| `ShowServiceTest` | Unit | 5 |
| `JWTServiceTest` | Unit | 6 |
| `SeatLockTest` | Unit + concurrency | 4 |
| `GlobalExceptionHandlerTest` | Unit | 3 |
| `SuperAdminSeederTest` | Integration | 2 |
| `AuthenticationControllerTest` | Integration | 5 |
| `MovieControllerTest` | Integration | 7 |
| `TheatreControllerTest` | Integration | 6 |
| `ReservationControllerTest` | Integration | 4 |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 3.3 |
| Language | Java 21 |
| Security | Spring Security + JWT (jjwt 0.12.6) |
| ORM | Spring Data JPA / Hibernate |
| Database (dev) | H2 in-memory |
| Database (prod) | PostgreSQL 16 |
| Validation | Jakarta Bean Validation |
| Build | Maven |
| Containerisation | Docker + Docker Compose |
| Testing | JUnit 5 + Mockito + MockMvc |
