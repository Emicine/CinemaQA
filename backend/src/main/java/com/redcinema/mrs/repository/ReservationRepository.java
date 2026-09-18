package com.redcinema.mrs.repository;

import com.redcinema.mrs.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Page<Reservation> findByUser_UserId(Long userId, Pageable pageable);

    long countByUser_UserId(Long userId);
}
