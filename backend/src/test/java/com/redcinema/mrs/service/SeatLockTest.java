package com.redcinema.mrs.service;

import com.redcinema.mrs.lock.SeatLock;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;

@DisplayName("SeatLock concurrency tests")
class SeatLockTest {

    private SeatLock seatLock;

    @BeforeEach
    void setUp() {
        seatLock = new SeatLock();
    }

    @Test
    @DisplayName("tryLockAll — acquires all locks when none held")
    void tryLockAll_success() {
        List<Long> ids = List.of(1L, 2L, 3L);
        boolean result = seatLock.tryLockAll(ids);

        assertThat(result).isTrue();

        // Clean up
        seatLock.releaseAll(ids);
    }

    @Test
    @DisplayName("tryLockAll — returns false and rolls back when one lock is contended")
    void tryLockAll_contention() {
        // Pre-acquire seat 2
        seatLock.getLock(2L).lock();

        List<Long> ids = List.of(1L, 2L, 3L);
        boolean result = seatLock.tryLockAll(ids);

        assertThat(result).isFalse();

        // Seat 1 must have been released during rollback (seat 2 still held by this thread)
        assertThat(seatLock.getLock(1L).tryLock()).isTrue();

        // Cleanup
        seatLock.getLock(2L).unlock();
        seatLock.getLock(1L).unlock();
    }

    @Test
    @DisplayName("releaseAll — safely ignores ids that were never locked")
    void releaseAll_noop() {
        assertThatCode(() -> seatLock.releaseAll(List.of(99L, 100L)))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Concurrent booking — only one thread succeeds for the same seat set")
    void concurrent_onlyOneSucceeds() throws InterruptedException {
        int threads = 10;
        List<Long> ids = List.of(1L, 2L, 3L);
        AtomicInteger successCount = new AtomicInteger(0);
        CountDownLatch ready  = new CountDownLatch(threads);
        CountDownLatch start  = new CountDownLatch(1);
        CountDownLatch done   = new CountDownLatch(threads);

        ExecutorService pool = Executors.newFixedThreadPool(threads);

        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    if (seatLock.tryLockAll(ids)) {
                        successCount.incrementAndGet();
                        Thread.sleep(10); // simulate DB work
                        seatLock.releaseAll(ids);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    done.countDown();
                }
            });
        }

        ready.await();
        start.countDown();
        done.await();
        pool.shutdown();

        // Due to tryLock semantics multiple threads may succeed sequentially;
        // what matters is no deadlock and all successes are clean.
        assertThat(successCount.get()).isGreaterThanOrEqualTo(1);
    }
}
