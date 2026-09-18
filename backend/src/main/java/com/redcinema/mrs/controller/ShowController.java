package com.redcinema.mrs.controller;

import com.redcinema.mrs.dto.APIResponseDTO;
import com.redcinema.mrs.dto.PagedAPIResponseDTO;
import com.redcinema.mrs.dto.show.ShowRequestDTO;
import com.redcinema.mrs.entity.Show;
import com.redcinema.mrs.service.ShowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shows")
@RequiredArgsConstructor
public class ShowController {

    private final ShowService showService;

    // ── GET endpoints  [PUBLIC] ───────────────────────────────────────────────

    @GetMapping("/all")
    public ResponseEntity<PagedAPIResponseDTO> getAllShows(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        Page<Show> shows = showService.getAllShows(page, pageSize);
        return ResponseEntity.ok(toPagedResponse(shows));
    }

    @GetMapping("/show/{showId}")
    public ResponseEntity<APIResponseDTO> getShowById(@PathVariable Long showId) {
        return ResponseEntity.ok(APIResponseDTO.builder()
                .data(showService.getShowById(showId))
                .build());
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<PagedAPIResponseDTO> getShowsByMovie(
            @PathVariable Long movieId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        return ResponseEntity.ok(toPagedResponse(
                showService.getShowsByMovie(movieId, page, pageSize)));
    }

    @GetMapping("/theatre/{theatreId}")
    public ResponseEntity<PagedAPIResponseDTO> getShowsByTheatre(
            @PathVariable Long theatreId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        return ResponseEntity.ok(toPagedResponse(
                showService.getShowsByTheatre(theatreId, page, pageSize)));
    }

    @GetMapping("/screen/{screenId}")
    public ResponseEntity<PagedAPIResponseDTO> getShowsByScreen(
            @PathVariable Long screenId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        return ResponseEntity.ok(toPagedResponse(
                showService.getShowsByScreen(screenId, page, pageSize)));
    }

    // ── POST /api/shows/show/create  [SUPER_ADMIN | THEATRE_ADMIN] ───────────
    @PreAuthorize("@userRoleValidationService" +
                  ".isUserHavePermissionToPerformWriteOperationForScreen(#dto.screenId)")
    @PostMapping("/show/create")
    public ResponseEntity<APIResponseDTO> createShow(@Valid @RequestBody ShowRequestDTO dto) {
        Show show = showService.createShow(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(APIResponseDTO.builder()
                .message("Show created with id: " + show.getShowId())
                .data(show)
                .build());
    }

    // ── PUT /api/shows/show/{showId}  [SUPER_ADMIN | THEATRE_ADMIN] ──────────
    @PreAuthorize("@userRoleValidationService" +
                  ".isUserHavePermissionToPerformWriteOperationForShow(#showId)")
    @PutMapping("/show/{showId}")
    public ResponseEntity<APIResponseDTO> updateShow(
            @PathVariable Long showId,
            @Valid @RequestBody ShowRequestDTO dto) {

        Show show = showService.updateShow(showId, dto);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("Show " + show.getShowId() + " updated.")
                .data(show)
                .build());
    }

    // ── DELETE /api/shows/show/{showId}  [SUPER_ADMIN | THEATRE_ADMIN] ───────
    @PreAuthorize("@userRoleValidationService" +
                  ".isUserHavePermissionToPerformWriteOperationForShow(#showId)")
    @DeleteMapping("/show/{showId}")
    public ResponseEntity<APIResponseDTO> deleteShow(@PathVariable Long showId) {
        Show show = showService.getShowById(showId);
        showService.deleteShow(showId);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("Deleted show id: " + show.getShowId()
                         + " — " + show.getMovie().getMovieName())
                .build());
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private PagedAPIResponseDTO toPagedResponse(Page<Show> page) {
        return PagedAPIResponseDTO.builder()
                .pageData(page.getContent())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentLimit(page.getNumberOfElements())
                .build();
    }
}
