package com.redcinema.mrs.lock;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Application-scoped seat-lock registry.
 *
 * Each ShowSeat gets its own {@link ReentrantLock}.
 * The booking flow:
 *   1. tryLock() all requested seat IDs → throw 409 if any is already locked.
 *   2. Validate availability in DB.
 *   3. Persist the reservation.
 *   4. release() all locks regardless of outcome.
 *
 * Locks are stored per showSeatId so concurrent bookings for *different*
 * seats on the same show are not serialised unnecessarily.
 */
@Component
public class SeatLock {

    private final ConcurrentHashMap<Long, ReentrantLock> locks = new ConcurrentHashMap<>();

    /** Returns the lock for {@code showSeatId}, creating one if absent. */
    public ReentrantLock getLock(Long showSeatId) {
        return locks.computeIfAbsent(showSeatId, id -> new ReentrantLock());
    }

    /**
     * Attempts a non-blocking acquisition on every seat.
     * Returns {@code true} if ALL were acquired; {@code false} if ANY failed
     * (all previously acquired locks are released before returning false).
     */
    public boolean tryLockAll(Iterable<Long> showSeatIds) {
        java.util.List<Long> acquired = new java.util.ArrayList<>();
        for (Long id : showSeatIds) {
            if (getLock(id).tryLock()) {
                acquired.add(id);
            } else {
                // Roll back any locks already acquired in this attempt
                acquired.forEach(a -> getLock(a).unlock());
                return false;
            }
        }
        return true;
    }

    /** Releases and removes the lock for each id (ignores ids with no lock). */
    public void releaseAll(Iterable<Long> showSeatIds) {
        for (Long id : showSeatIds) {
            ReentrantLock lock = locks.remove(id);
            if (lock != null && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
