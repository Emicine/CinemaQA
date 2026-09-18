package com.redcinema.mrs.controller;

import com.redcinema.mrs.dto.APIResponseDTO;
import com.redcinema.mrs.dto.PagedAPIResponseDTO;
import com.redcinema.mrs.dto.reservation.ReservationRequestDTO;
import com.redcinema.mrs.entity.Reservation;
import com.redcinema.mrs.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // ── GET /api/reservations/user/{userId}/all  [AUTHENTICATED] ─────────────
    @GetMapping("/user/{userId}/all")
    public ResponseEntity<PagedAPIResponseDTO> getReservationsForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        Page<Reservation> reservations =
                reservationService.getReservationsForUser(userId, page, pageSize);

        return ResponseEntity.ok(PagedAPIResponseDTO.builder()
                .pageData(reservations.getContent())
                .totalElements(reservations.getTotalElements())
                .totalPages(reservations.getTotalPages())
                .currentLimit(reservations.getNumberOfElements())
                .build());
    }

    // ── POST /api/reservations/reserve  [ROLE_USER] ───────────────────────────
    @Secured("ROLE_USER")
    @PostMapping("/reserve")
    public ResponseEntity<APIResponseDTO> createReservation(
            @Valid @RequestBody ReservationRequestDTO dto) {

        Reservation reservation = reservationService.createReservation(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(APIResponseDTO.builder()
                .message("Reservation created with id: " + reservation.getReservationId())
                .data(reservation)
                .build());
    }

    // ── PUT /api/reservations/cancel/{reservationId}  [owner | SUPER_ADMIN] ───
    @PreAuthorize("@userRoleValidationService" +
                  ".isUserHavePermissionToCancelReservation(#reservationId)")
    @PutMapping("/cancel/{reservationId}")
    public ResponseEntity<APIResponseDTO> cancelReservation(
            @PathVariable Long reservationId) {

        boolean cancelled = reservationService.cancelReservation(reservationId);
        String message = cancelled
                ? "Reservation " + reservationId + " cancelled successfully."
                : "Reservation " + reservationId + " was already cancelled.";

        return ResponseEntity.ok(APIResponseDTO.builder()
                .message(message)
                .build());
    }
}
