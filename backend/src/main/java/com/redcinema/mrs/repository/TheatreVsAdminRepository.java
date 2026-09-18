package com.redcinema.mrs.repository;
import com.redcinema.mrs.entity.TheatreVsAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface TheatreVsAdminRepository extends JpaRepository<TheatreVsAdmin, Long> {
    Optional<TheatreVsAdmin> findByTheatre_TheatreIdAndUser_UserId(Long theatreId, Long userId);
    boolean existsByTheatre_TheatreIdAndUser_UserId(Long theatreId, Long userId);
}
