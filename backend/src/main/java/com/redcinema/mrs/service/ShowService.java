package com.redcinema.mrs.service;

import com.redcinema.mrs.constants.ExceptionConstants;
import com.redcinema.mrs.dto.show.ShowRequestDTO;
import com.redcinema.mrs.entity.*;
import com.redcinema.mrs.exception.ShowNotFoundException;
import com.redcinema.mrs.repository.ShowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowService {

    private final ShowRepository showRepository;
    private final MovieService movieService;
    private final ScreenService screenService;
    private final ShowSeatService showSeatService;

    // ── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<Show> getAllShows(int page, int pageSize) {
        Page<Show> shows = showRepository.findAll(
                PageRequest.of(page, pageSize)
        );

        initializeShows(shows.getContent());

        return shows;
    }

    @Transactional(readOnly = true)
    public Show getShowById(Long showId) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new ShowNotFoundException(
                        ExceptionConstants.SHOW_NOT_FOUND,
                        HttpStatus.NOT_FOUND
                ));

        initializeShow(show);

        return show;
    }

    @Transactional(readOnly = true)
    public Page<Show> getShowsByMovie(
            Long movieId,
            int page,
            int pageSize
    ) {
        Page<Show> shows = showRepository.findByMovie_MovieId(
                movieId,
                PageRequest.of(page, pageSize)
        );

        initializeShows(shows.getContent());

        return shows;
    }

    @Transactional(readOnly = true)
    public Page<Show> getShowsByTheatre(
            Long theatreId,
            int page,
            int pageSize
    ) {
        Page<Show> shows = showRepository.findByTheatre_TheatreId(
                theatreId,
                PageRequest.of(page, pageSize)
        );

        initializeShows(shows.getContent());

        return shows;
    }

    @Transactional(readOnly = true)
    public Page<Show> getShowsByScreen(
            Long screenId,
            int page,
            int pageSize
    ) {
        Page<Show> shows = showRepository.findByScreen_ScreenId(
                screenId,
                PageRequest.of(page, pageSize)
        );

        initializeShows(shows.getContent());

        return shows;
    }

    // ── Initialize relations ─────────────────────────────────────────────────

    /**
     * Initializes all Show entities and their relations while
     * the Hibernate session is still active.
     *
     * This is necessary because spring.jpa.open-in-view=false.
     */
    private void initializeShows(List<Show> shows) {
        for (Show show : shows) {
            initializeShow(show);
        }
    }

    /**
     * Initializes the relations required by the frontend:
     *
     * Show
     * ├── Movie
     * ├── Theatre
     * │   └── Screens
     * │       └── Seats
     * ├── Screen
     * │   └── Seats
     * └── ShowSeats
     *     └── Seat
     */
    private void initializeShow(Show show) {

        // ── Movie ────────────────────────────────────────────────────────────

        if (show.getMovie() != null) {
            show.getMovie().getMovieId();
        }

        // ── Theatre ──────────────────────────────────────────────────────────

        if (show.getTheatre() != null) {

            show.getTheatre().getTheatreId();

            // Theatre -> Screens
            if (show.getTheatre().getScreens() != null) {

                show.getTheatre().getScreens().size();

                // Screen -> Seats
                for (Screen screen : show.getTheatre().getScreens()) {

                    if (screen.getSeats() != null) {
                        screen.getSeats().size();
                    }
                }
            }
        }

        // ── Screen ───────────────────────────────────────────────────────────

        if (show.getScreen() != null) {

            show.getScreen().getScreenId();

            // Screen -> Seats
            if (show.getScreen().getSeats() != null) {
                show.getScreen().getSeats().size();
            }
        }

        // ── Show Seats ───────────────────────────────────────────────────────

        if (show.getShowSeats() != null) {

            show.getShowSeats().size();

            // ShowSeat -> Seat
            for (ShowSeat showSeat : show.getShowSeats()) {

                if (showSeat.getSeat() != null) {
                    showSeat.getSeat().getSeatId();
                }
            }
        }
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public Show createShow(ShowRequestDTO dto) {

        Movie movie = movieService.getMovieById(dto.getMovieId());

        Screen screen = screenService.getScreenById(dto.getScreenId());

        validateNoConflict(
                screen.getScreenId(),
                dto.getStartTime(),
                dto.getEndTime(),
                -1L
        );

        Show show = Show.builder()
                .movie(movie)
                .theatre(screen.getTheatre())
                .screen(screen)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .showSeats(new ArrayList<>())
                .build();

        show = showRepository.save(show);

        // Create one ShowSeat per physical seat on the screen
        List<ShowSeat> showSeats = new ArrayList<>();

        for (Seat seat : screen.getSeats()) {
            showSeats.add(
                    showSeatService.createShowSeat(show, seat)
            );
        }

        show.setShowSeats(showSeats);

        return showRepository.save(show);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public Show updateShow(
            Long showId,
            ShowRequestDTO dto
    ) {

        Show show = getShowById(showId);

        Movie movie = movieService.getMovieById(
                dto.getMovieId()
        );

        validateNoConflict(
                show.getScreen().getScreenId(),
                dto.getStartTime(),
                dto.getEndTime(),
                showId
        );

        show.setMovie(movie);
        show.setStartTime(dto.getStartTime());
        show.setEndTime(dto.getEndTime());

        return showRepository.save(show);
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteShow(Long showId) {

        getShowById(showId);

        showRepository.deleteById(showId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateNoConflict(
            Long screenId,
            LocalDateTime start,
            LocalDateTime end,
            Long excludeShowId
    ) {

        List<Show> conflicts = showRepository.findConflictingShows(
                screenId,
                start,
                end,
                excludeShowId
        );

        if (!conflicts.isEmpty()) {
            throw new ShowNotFoundException(
                    "The screen already has a show scheduled during that time slot.",
                    HttpStatus.CONFLICT
            );
        }
    }
}