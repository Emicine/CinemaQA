package com.redcinema.mrs.service;

import com.redcinema.mrs.entity.Reservation;
import com.redcinema.mrs.entity.Theatre;
import com.redcinema.mrs.entity.TheatreVsAdmin;
import com.redcinema.mrs.entity.User;
import com.redcinema.mrs.enums.UserRole;
import com.redcinema.mrs.repository.TheatreVsAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("userRoleValidationService")
@RequiredArgsConstructor
public class UserRoleValidationService {

    private final UserService userService;
    private final TheatreService theatreService;
    private final ScreenService screenService;
    private final ShowService showService;
    private final ReservationService reservationService;
    private final TheatreVsAdminRepository theatreVsAdminRepository;

    public boolean isSuperAdmin() {
        return hasRole(UserRole.ROLE_SUPER_ADMIN);
    }

    public boolean isTheatreAdminOrAbove() {
        return hasRole(UserRole.ROLE_THEATRE_ADMIN)
                || hasRole(UserRole.ROLE_SUPER_ADMIN);
    }

    private boolean hasRole(UserRole role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null) {
            return false;
        }

        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(role.name()));
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userService.getUserByUsername(auth.getName());
    }

    public boolean isUserHavePermissionToPerformWriteOperationForTheatre(Long theatreId) {
        if (isSuperAdmin()) {
            return true;
        }

        if (!isTheatreAdminOrAbove()) {
            return false;
        }

        User me = currentUser();
        Theatre theatre = theatreService.getTheatreById(theatreId);

        return theatre.getTheatreAdmins().stream()
                .map(TheatreVsAdmin::getUser)
                .anyMatch(u -> u.getUserId().equals(me.getUserId()));
    }

    public boolean isUserHavePermissionToPerformWriteOperationForShow(Long showId) {
        if (isSuperAdmin()) {
            return true;
        }

        if (!isTheatreAdminOrAbove()) {
            return false;
        }

        User me = currentUser();
        Theatre theatre = showService.getShowById(showId).getTheatre();

        return theatre.getTheatreAdmins().stream()
                .map(TheatreVsAdmin::getUser)
                .anyMatch(u -> u.getUserId().equals(me.getUserId()));
    }

    /**
     * Vérifie que le Theatre Admin connecté
     * possède les droits sur le théâtre
     * auquel appartient l'écran.
     *
     * La vérification est faite directement en base
     * afin d'éviter les problèmes de proxy LAZY Hibernate.
     */
    public boolean isUserHavePermissionToPerformWriteOperationForScreen(Long screenId) {

        if (isSuperAdmin()) {
            return true;
        }

        if (!isTheatreAdminOrAbove()) {
            return false;
        }

        User me = currentUser();

        // Récupère directement le theatre_id de l'écran
        Long theatreId = screenService.getTheatreIdByScreenId(screenId);

        if (theatreId == null) {
            return false;
        }

        // Vérifie directement en base si l'utilisateur
        // est administrateur de ce théâtre.
        return theatreVsAdminRepository
                .existsByTheatre_TheatreIdAndUser_UserId(
                        theatreId,
                        me.getUserId()
                );
    }

    public boolean isUserHavePermissionToCancelReservation(Long reservationId) {
        if (isSuperAdmin()) {
            return true;
        }

        Reservation reservation = reservationService.getReservationById(reservationId);
        User me = currentUser();

        return me.getUserId().equals(reservation.getUser().getUserId());
    }
}