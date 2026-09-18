package com.redcinema.mrs.controller;

import com.redcinema.mrs.dto.APIResponseDTO;
import com.redcinema.mrs.dto.PagedAPIResponseDTO;
import com.redcinema.mrs.dto.theatre.TheatreRequestDTO;
import com.redcinema.mrs.dto.user.TheatreAdminRequestDTO;
import com.redcinema.mrs.entity.Theatre;
import com.redcinema.mrs.service.TheatreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/theatres")
@RequiredArgsConstructor
public class TheatreController {

    private final TheatreService theatreService;

    // ── GET /api/theatres/all  [PUBLIC] ───────────────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<PagedAPIResponseDTO> getAllTheatres(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        Page<Theatre> theatres = theatreService.getAllTheatres(page, pageSize);
        return ResponseEntity.ok(PagedAPIResponseDTO.builder()
                .pageData(theatres.getContent())
                .totalElements(theatres.getTotalElements())
                .totalPages(theatres.getTotalPages())
                .currentLimit(theatres.getNumberOfElements())
                .build());
    }

    // ── GET /api/theatres/theatre/{theatreId}  [PUBLIC] ───────────────────────
    @GetMapping("/theatre/{theatreId}")
    public ResponseEntity<APIResponseDTO> getTheatreById(@PathVariable Long theatreId) {
        return ResponseEntity.ok(APIResponseDTO.builder()
                .data(theatreService.getTheatreById(theatreId))
                .build());
    }

    // ── POST /api/theatres/theatre/create  [SUPER_ADMIN] ─────────────────────
    @Secured("ROLE_SUPER_ADMIN")
    @PostMapping("/theatre/create")
    public ResponseEntity<APIResponseDTO> createTheatre(
            @Valid @RequestBody TheatreRequestDTO dto) {

        Theatre theatre = theatreService.createTheatre(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(APIResponseDTO.builder()
                .message("Theatre created with id: " + theatre.getTheatreId())
                .data(theatre)
                .build());
    }

    // ── PUT /api/theatres/theatre/{theatreId}  [SUPER_ADMIN | THEATRE_ADMIN] ──
    @PreAuthorize("@userRoleValidationService" +
                  ".isUserHavePermissionToPerformWriteOperationForTheatre(#theatreId)")
    @PutMapping("/theatre/{theatreId}")
    public ResponseEntity<APIResponseDTO> updateTheatre(
            @PathVariable Long theatreId,
            @Valid @RequestBody TheatreRequestDTO dto) {

        Theatre theatre = theatreService.updateTheatre(theatreId, dto);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("Theatre " + theatre.getTheatreId() + " updated.")
                .data(theatre)
                .build());
    }

    // ── DELETE /api/theatres/theatre/{theatreId}  [SUPER_ADMIN | THEATRE_ADMIN]
    // BUG FIX: original param was named 'userId' instead of 'theatreId'
    @PreAuthorize("@userRoleValidationService" +
                  ".isUserHavePermissionToPerformWriteOperationForTheatre(#theatreId)")
    @DeleteMapping("/theatre/{theatreId}")
    public ResponseEntity<APIResponseDTO> deleteTheatre(@PathVariable Long theatreId) {
        Theatre theatre = theatreService.getTheatreById(theatreId);
        theatreService.deleteTheatre(theatreId);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("Deleted theatre id: " + theatre.getTheatreId()
                         + " — " + theatre.getTheatreName())
                .build());
    }

    // ── POST /api/theatres/theatre/admin  [SUPER_ADMIN | THEATRE_ADMIN] ───────
    @PreAuthorize("@userRoleValidationService" +
                  ".isUserHavePermissionToPerformWriteOperationForTheatre(#dto.theatreId)")
    @PostMapping("/theatre/admin")
    public ResponseEntity<APIResponseDTO> addTheatreAdmin(
            @Valid @RequestBody TheatreAdminRequestDTO dto) {

        Theatre theatre = theatreService.addTheatreAdmin(dto);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("Admin added to theatre: " + theatre.getTheatreName())
                .data(theatre)
                .build());
    }

    // ── DELETE /api/theatres/theatre/admin  [SUPER_ADMIN | THEATRE_ADMIN] ─────
    @PreAuthorize("@userRoleValidationService" +
                  ".isUserHavePermissionToPerformWriteOperationForTheatre(#dto.theatreId)")
    @DeleteMapping("/theatre/admin")
    public ResponseEntity<APIResponseDTO> removeTheatreAdmin(
            @Valid @RequestBody TheatreAdminRequestDTO dto) {

        Theatre theatre = theatreService.removeTheatreAdmin(dto);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("Admin removed from theatre: " + theatre.getTheatreName())
                .build());
    }
}
