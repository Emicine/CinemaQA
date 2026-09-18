package com.redcinema.mrs.repository;

import com.redcinema.mrs.entity.Screen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ScreenRepository extends JpaRepository<Screen, Long> {

    @Query("SELECT s.theatre.theatreId FROM Screen s WHERE s.screenId = :screenId")
    Long findTheatreIdByScreenId(@Param("screenId") Long screenId);
}