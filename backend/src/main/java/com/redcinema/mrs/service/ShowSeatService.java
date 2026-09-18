package com.redcinema.mrs.service;

import com.redcinema.mrs.constants.ExceptionConstants;
import com.redcinema.mrs.entity.Seat;
import com.redcinema.mrs.entity.Show;
import com.redcinema.mrs.entity.ShowSeat;
import com.redcinema.mrs.enums.SeatStatus;
import com.redcinema.mrs.exception.AvailableShowSeatsNotFoundException;
import com.redcinema.mrs.lock.SeatLock;
import com.redcinema.mrs.exception.SeatAlreadyLockedException;
import com.redcinema.mrs.repository.ShowSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowSeatService {

    private final ShowSeatRepository showSeatRepository;
    private final SeatLock seatLock;

    // ── Creation (called when a Show is created) ───────────────────────────────

    @Transactional
    public ShowSeat createShowSeat(Show show, Seat seat) {
        ShowSeat ss = ShowSeat.builder()
                .show(show)
                .seat(seat)
                .seatStatus(SeatStatus.AVAILABLE)
                .build();
        return showSeatRepository.save(ss);
    }

    // ── Retrieval ────────────────────────────────────────────────────────────

    public List<ShowSeat> getShowSeatsByIds(List<Long> ids) {
        return showSeatRepository.findAllById(ids);
    }

    public List<ShowSeat> getAvailableShowSeats(List<Long> ids) {
        return showSeatRepository.findAllById(ids)
                .stream()
                .filter(ss -> ss.getSeatStatus() == SeatStatus.AVAILABLE)
                .toList();
    }

    // ── Locking ───────────────────────────────────────────────────────────────

    /**
     * Tries to acquire ReentrantLocks on all seat IDs.
     * Throws 409 CONFLICT if any seat is already locked by another thread.
     */
    public void acquireLocks(List<Long> showSeatIds) {
        if (!seatLock.tryLockAll(showSeatIds)) {
            throw new SeatAlreadyLockedException(
                    ExceptionConstants.SEAT_ALREADY_LOCKED, HttpStatus.CONFLICT);
        }
    }

    public void releaseLocks(List<Long> showSeatIds) {
        seatLock.releaseAll(showSeatIds);
    }

    // ── Booking ───────────────────────────────────────────────────────────────

    /**
     * Marks seats BOOKED and returns the total price.
     * Must be called inside a transaction with locks held.
     */
    @Transactional
    public double bookSeats(List<ShowSeat> showSeats) {
        double total = 0.0;
        for (ShowSeat ss : showSeats) {
            ss.setSeatStatus(SeatStatus.BOOKED);
            total += ss.getSeat().getSeatPrice();
        }
        showSeatRepository.saveAll(showSeats);
        return total;
    }

    // ── Cancellation ─────────────────────────────────────────────────────────

    @Transactional
    public void releaseSeats(List<ShowSeat> showSeats) {
        for (ShowSeat ss : showSeats) {
            ss.setSeatStatus(SeatStatus.AVAILABLE);
        }
        showSeatRepository.saveAll(showSeats);
    }
}
