package com.redcinema.mrs.service;

import com.redcinema.mrs.constants.ExceptionConstants;
import com.redcinema.mrs.dto.theatre.TheatreRequestDTO;
import com.redcinema.mrs.dto.user.TheatreAdminRequestDTO;
import com.redcinema.mrs.entity.Screen;
import com.redcinema.mrs.entity.Theatre;
import com.redcinema.mrs.entity.TheatreVsAdmin;
import com.redcinema.mrs.entity.User;
import com.redcinema.mrs.exception.TheatreNotFoundException;
import com.redcinema.mrs.exception.UserConflictException;
import com.redcinema.mrs.repository.TheatreRepository;
import com.redcinema.mrs.repository.TheatreVsAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import com.redcinema.mrs.enums.UserRole;

@Service
@RequiredArgsConstructor
public class TheatreService {

    private final TheatreRepository theatreRepository;
    private final TheatreVsAdminRepository theatreVsAdminRepository;
    private final UserService userService;
    private final ScreenService screenService;

    // ── Read ─────────────────────────────────────────────────────────────────

    public Page<Theatre> getAllTheatres(int page, int pageSize) {
        return theatreRepository.findAll(PageRequest.of(page, pageSize));
    }

    public Theatre getTheatreById(Long theatreId) {
        return theatreRepository.findById(theatreId)
                .orElseThrow(() -> new TheatreNotFoundException(
                        ExceptionConstants.THEATRE_NOT_FOUND, HttpStatus.NOT_FOUND));
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public Theatre createTheatre(TheatreRequestDTO dto) {

        User adminUser = userService.getUserById(
                dto.getTheatreAdminId()
        );

        // Vérifier que l'utilisateur est déjà theatre admin
        if (adminUser.getUserRole() != UserRole.ROLE_THEATRE_ADMIN) {
            throw new IllegalArgumentException(
                    "The selected user is not a theatre admin"
            );
        }

        Theatre theatre = Theatre.builder()
                .theatreName(dto.getTheatreName())
                .theatreLocation(dto.getTheatreLocation())
                .totalBookings(0)
                .totalRevenue(0.0)
                .theatreAdmins(new ArrayList<>())
                .screens(new ArrayList<>())
                .build();

        // Créer la relation entre le cinéma et son administrateur
        TheatreVsAdmin adminLink = TheatreVsAdmin.builder()
                .theatre(theatre)
                .user(adminUser)
                .build();

        theatre.getTheatreAdmins().add(adminLink);

        // Sauvegarder le cinéma pour générer son ID
        theatre = theatreRepository.save(theatre);

        // Créer les écrans et les sièges
        List<Screen> screens = new ArrayList<>();

        for (var screenDto : dto.getScreens()) {
            screens.add(screenService.createScreen(theatre, screenDto));
        }

        theatre.setScreens(screens);
        theatre.setTotalScreens(screens.size());

        return theatreRepository.save(theatre);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public Theatre updateTheatre(Long theatreId, TheatreRequestDTO dto) {
        Theatre theatre = getTheatreById(theatreId);
        theatre.setTheatreName(dto.getTheatreName());
        theatre.setTheatreLocation(dto.getTheatreLocation());
        return theatreRepository.save(theatre);
    }

    /** Internal save used by ReservationService to update revenue/bookings. */
    @Transactional
    public Theatre save(Theatre theatre) {
        return theatreRepository.save(theatre);
    }

    // ── Admin Management ──────────────────────────────────────────────────────

    @Transactional
    public Theatre addTheatreAdmin(TheatreAdminRequestDTO dto) {
        Theatre theatre = getTheatreById(dto.getTheatreId());
        User user = userService.getUserById(dto.getUserId());

        if (theatreVsAdminRepository.existsByTheatre_TheatreIdAndUser_UserId(
                dto.getTheatreId(), dto.getUserId())) {
            throw new UserConflictException(
                    "User is already an admin of this theatre.", HttpStatus.CONFLICT);
        }

        TheatreVsAdmin link = TheatreVsAdmin.builder()
                .theatre(theatre)
                .user(user)
                .build();
        theatre.getTheatreAdmins().add(link);

        return theatreRepository.save(theatre);
    }

    @Transactional
    public Theatre removeTheatreAdmin(TheatreAdminRequestDTO dto) {
        Theatre theatre = getTheatreById(dto.getTheatreId());

        TheatreVsAdmin link = theatreVsAdminRepository
                .findByTheatre_TheatreIdAndUser_UserId(dto.getTheatreId(), dto.getUserId())
                .orElseThrow(() -> new TheatreNotFoundException(
                        "Admin assignment not found.", HttpStatus.NOT_FOUND));

        theatre.getTheatreAdmins().remove(link);
        theatreVsAdminRepository.delete(link);

        return theatreRepository.save(theatre);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteTheatre(Long theatreId) {
        getTheatreById(theatreId);
        theatreRepository.deleteById(theatreId);
    }
}
