package com.redcinema.mrs.repository;
import com.redcinema.mrs.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {}
