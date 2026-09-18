package com.redcinema.mrs.service;

import com.redcinema.mrs.constants.ExceptionConstants;
import com.redcinema.mrs.dto.reservation.ReservationRequestDTO;
import com.redcinema.mrs.entity.*;
import com.redcinema.mrs.enums.ReservationStatus;
import com.redcinema.mrs.exception.AvailableShowSeatsNotFoundException;
import com.redcinema.mrs.exception.ReservationNotCancellableException;
import com.redcinema.mrs.exception.ReservationNotFoundException;
import com.redcinema.mrs.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserService userService;
    private final ShowService showService;
    private final ShowSeatService showSeatService;
    private final TheatreService theatreService;

    // ── Read ─────────────────────────────────────────────────────────────────

    public Page<Reservation> getReservationsForUser(Long userId, int page, int pageSize) {
        return reservationRepository.findByUser_UserId(userId, PageRequest.of(page, pageSize));
    }

    public Reservation getReservationById(Long reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ReservationNotFoundException(
                        ExceptionConstants.RESERVATION_NOT_FOUND, HttpStatus.NOT_FOUND));
    }

    // ── Create ────────────────────────────────────────────────────────────────

    /**
     * Full booking flow:
     *  1. Try to lock all requested ShowSeat IDs (ReentrantLock) → 409 if any taken.
     *  2. Re-validate availability in DB (double-check after lock).
     *  3. Mark seats BOOKED and compute total.
     *  4. Persist Reservation.
     *  5. Update Theatre revenue / booking count.
     *  6. Release all locks.
     */
    @Transactional
    public Reservation createReservation(ReservationRequestDTO dto) {
        List<Long> showSeatIds = dto.getShowSeats()
                .stream()
                .map(s -> s.getSeatId())
                .toList();

        // Step 1 – acquire locks
        showSeatService.acquireLocks(showSeatIds);

        try {
            // Step 2 – validate DB availability
            List<ShowSeat> available = showSeatService.getAvailableShowSeats(showSeatIds);
            if (available.size() != showSeatIds.size()) {
                throw new AvailableShowSeatsNotFoundException(
                        ExceptionConstants.AVAILABLE_SHOW_SEATS_NOT_FOUND, HttpStatus.CONFLICT);
            }

            User user = userService.getUserById(dto.getUserId());
            Show show = showService.getShowById(dto.getShowId());

            // Step 3 – book seats
            double total = showSeatService.bookSeats(available);

            // Step 4 – persist reservation
            Reservation reservation = Reservation.builder()
                    .user(user)
                    .show(show)
                    .seatsReserved(available)
                    .totalAmount(total)
                    .reservationStatus(ReservationStatus.BOOKED)
                    .build();
            reservation = reservationRepository.save(reservation);

            // Step 5 – update theatre stats
            Theatre theatre = show.getTheatre();
            theatre.setTotalRevenue(theatre.getTotalRevenue() + total);
            theatre.setTotalBookings(theatre.getTotalBookings() + available.size());
            theatreService.save(theatre);

            return reservation;

        } finally {
            // Step 6 – always release locks
            showSeatService.releaseLocks(showSeatIds);
        }
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    /**
     * Cancels a reservation.
     * BUG FIX: original subtracted totalAmount but *added* seat count to totalBookings.
     * Correct behaviour: subtract both amount AND seat count.
     *
     * @return {@code true} if cancelled now; {@code false} if already cancelled.
     */
    @Transactional
    public boolean cancelReservation(Long reservationId) {
        Reservation reservation = getReservationById(reservationId);

        if (reservation.getReservationStatus() == ReservationStatus.CANCELLED) {
            return false;
        }

        if (!isCancellable(reservation.getShow())) {
            throw new ReservationNotCancellableException(
                    ExceptionConstants.RESERVATION_NOT_CANCELLABLE, HttpStatus.UNPROCESSABLE_ENTITY);
        }

        reservation.setReservationStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        // Release seats back to AVAILABLE
        showSeatService.releaseSeats(reservation.getSeatsReserved());

        // BUG FIX: subtract, not add, the booking count
        Theatre theatre = reservation.getShow().getTheatre();
        theatre.setTotalRevenue(theatre.getTotalRevenue() - reservation.getTotalAmount());
        theatre.setTotalBookings(
                Math.max(0, theatre.getTotalBookings() - reservation.getSeatsReserved().size()));
        theatreService.save(theatre);

        return true;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** A show is cancellable if it starts more than 30 minutes from now. */
    private boolean isCancellable(Show show) {
        return show.getStartTime().isAfter(LocalDateTime.now().plusMinutes(30));
    }
}
