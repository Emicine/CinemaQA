package com.redcinema.mrs.repository;

import com.redcinema.mrs.entity.Show;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    Page<Show> findByMovie_MovieId(Long movieId, Pageable pageable);

    Page<Show> findByTheatre_TheatreId(Long theatreId, Pageable pageable);

    Page<Show> findByScreen_ScreenId(Long screenId, Pageable pageable);

    @Query("""
           SELECT s FROM Show s
           WHERE s.theatre.theatreId = :theatreId
             AND s.startTime > :now
           ORDER BY s.startTime ASC
           """)
    List<Show> findUpcomingByTheatreId(Long theatreId, LocalDateTime now);

    @Query("""
           SELECT s FROM Show s
           WHERE s.screen.screenId = :screenId
             AND s.showId <> :excludeShowId
             AND s.startTime < :endTime
             AND s.endTime > :startTime
           """)
    List<Show> findConflictingShows(
            Long screenId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Long excludeShowId
    );
}