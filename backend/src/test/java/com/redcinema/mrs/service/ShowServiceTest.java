package com.redcinema.mrs.service;

import com.redcinema.mrs.dto.show.ShowRequestDTO;
import com.redcinema.mrs.entity.*;
import com.redcinema.mrs.enums.Genre;
import com.redcinema.mrs.exception.ShowNotFoundException;
import com.redcinema.mrs.repository.ShowRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ShowService unit tests")
class ShowServiceTest {

    @Mock ShowRepository showRepository;
    @Mock MovieService movieService;
    @Mock ScreenService screenService;
    @Mock ShowSeatService showSeatService;

    @InjectMocks ShowService showService;

    private Movie movie;
    private Theatre theatre;
    private Screen screen;
    private Seat seat;
    private Show show;

    @BeforeEach
    void setUp() {
        movie = Movie.builder().movieId(1L).movieName("Oppenheimer")
                .movieGenre(Genre.DRAMA).movieDuration(180L).build();

        theatre = Theatre.builder().theatreId(1L).theatreName("PVR").build();

        seat = Seat.builder().seatId(1L).rowId(1).seatNumber(1)
                .seatPrice(300.0).build();

        screen = Screen.builder().screenId(1L).screenName("Screen A")
                .theatre(theatre).seats(List.of(seat)).build();

        show = Show.builder()
                .showId(1L).movie(movie).theatre(theatre).screen(screen)
                .startTime(LocalDateTime.now().plusHours(2))
                .endTime(LocalDateTime.now().plusHours(5))
                .showSeats(new ArrayList<>())
                .build();
    }

    // ── getShowById ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("getShowById — returns show when found")
    void getShowById_found() {
        when(showRepository.findById(1L)).thenReturn(Optional.of(show));
        Show result = showService.getShowById(1L);
        assertThat(result.getShowId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getShowById — throws ShowNotFoundException when missing")
    void getShowById_notFound() {
        when(showRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> showService.getShowById(99L))
                .isInstanceOf(ShowNotFoundException.class);
    }

    // ── createShow ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("createShow — creates ShowSeat for every seat on the screen")
    void createShow_createsShowSeats() {
        ShowRequestDTO dto = new ShowRequestDTO();
        dto.setMovieId(1L);
        dto.setScreenId(1L);
        dto.setStartTime(LocalDateTime.now().plusDays(1));
        dto.setEndTime(LocalDateTime.now().plusDays(1).plusHours(3));

        when(movieService.getMovieById(1L)).thenReturn(movie);
        when(screenService.getScreenById(1L)).thenReturn(screen);
        when(showRepository.findConflictingShows(eq(1L), any(), any(), eq(-1L)))
                .thenReturn(List.of());
        when(showRepository.save(any())).thenAnswer(inv -> {
            Show s = inv.getArgument(0);
            s.setShowId(10L);
            return s;
        });

        ShowSeat showSeat = ShowSeat.builder().showSeatId(100L).build();
        when(showSeatService.createShowSeat(any(), any())).thenReturn(showSeat);

        Show created = showService.createShow(dto);

        assertThat(created.getShowId()).isEqualTo(10L);
        // One seat on screen → one ShowSeat created
        verify(showSeatService, times(1)).createShowSeat(any(), eq(seat));
    }

    @Test
    @DisplayName("createShow — throws 409 when screen has a scheduling conflict")
    void createShow_conflict() {
        ShowRequestDTO dto = new ShowRequestDTO();
        dto.setMovieId(1L);
        dto.setScreenId(1L);
        dto.setStartTime(LocalDateTime.now().plusHours(1));
        dto.setEndTime(LocalDateTime.now().plusHours(4));

        when(movieService.getMovieById(1L)).thenReturn(movie);
        when(screenService.getScreenById(1L)).thenReturn(screen);
        when(showRepository.findConflictingShows(eq(1L), any(), any(), eq(-1L)))
                .thenReturn(List.of(show)); // conflict!

        assertThatThrownBy(() -> showService.createShow(dto))
                .isInstanceOf(ShowNotFoundException.class)
                .hasMessageContaining("conflict");
    }

    // ── deleteShow ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteShow — delegates to repository")
    void deleteShow_success() {
        when(showRepository.findById(1L)).thenReturn(Optional.of(show));
        doNothing().when(showRepository).deleteById(1L);

        assertThatCode(() -> showService.deleteShow(1L)).doesNotThrowAnyException();
        verify(showRepository).deleteById(1L);
    }
}
