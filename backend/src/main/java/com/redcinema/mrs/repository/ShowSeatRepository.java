package com.redcinema.mrs.repository;
import com.redcinema.mrs.entity.ShowSeat;
import com.redcinema.mrs.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {
    List<ShowSeat> findByShow_ShowIdAndSeatStatus(Long showId, SeatStatus seatStatus);
}
