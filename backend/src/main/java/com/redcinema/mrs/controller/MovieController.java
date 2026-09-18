package com.redcinema.mrs.controller;

import com.redcinema.mrs.dto.APIResponseDTO;
import com.redcinema.mrs.dto.PagedAPIResponseDTO;
import com.redcinema.mrs.dto.movie.MovieRequestDTO;
import com.redcinema.mrs.entity.Movie;
import com.redcinema.mrs.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    // ── GET /api/movies/all  [PUBLIC] ─────────────────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<PagedAPIResponseDTO> getAllMovies(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int pageSize) {

        Page<Movie> movies = movieService.getAllMovies(page, pageSize);
        return ResponseEntity.ok(PagedAPIResponseDTO.builder()
                .pageData(movies.getContent())
                .totalElements(movies.getTotalElements())
                .totalPages(movies.getTotalPages())
                .currentLimit(movies.getNumberOfElements())
                .build());
    }

    // ── GET /api/movies/movie/{movieId}  [PUBLIC] ─────────────────────────────
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<APIResponseDTO> getMovieById(@PathVariable Long movieId) {
        return ResponseEntity.ok(APIResponseDTO.builder()
                .data(movieService.getMovieById(movieId))
                .build());
    }

    // ── POST /api/movies/movie/create  [SUPER_ADMIN] ──────────────────────────
    @Secured("ROLE_SUPER_ADMIN")
    @PostMapping("/movie/create")
    public ResponseEntity<APIResponseDTO> createMovie(
            @Valid @RequestBody MovieRequestDTO dto) {

        Movie movie = movieService.createMovie(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(APIResponseDTO.builder()
                .message("Movie created with id: " + movie.getMovieId())
                .data(movie)
                .build());
    }

    // ── PUT /api/movies/movie/{movieId}  [SUPER_ADMIN] ────────────────────────
    @Secured("ROLE_SUPER_ADMIN")
    @PutMapping("/movie/{movieId}")
    public ResponseEntity<APIResponseDTO> updateMovie(
            @PathVariable Long movieId,
            @Valid @RequestBody MovieRequestDTO dto) {

        Movie movie = movieService.updateMovie(movieId, dto);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("Movie " + movie.getMovieId() + " updated.")
                .data(movie)
                .build());
    }

    // ── DELETE /api/movies/movie/{movieId}  [SUPER_ADMIN] ────────────────────
    @Secured("ROLE_SUPER_ADMIN")
    @DeleteMapping("/movie/{movieId}")
    public ResponseEntity<APIResponseDTO> deleteMovie(@PathVariable Long movieId) {
        Movie movie = movieService.getMovieById(movieId);
        movieService.deleteMovie(movieId);
        return ResponseEntity.ok(APIResponseDTO.builder()
                .message("Deleted movie id: " + movie.getMovieId()
                         + " — " + movie.getMovieName())
                .build());
    }
}
