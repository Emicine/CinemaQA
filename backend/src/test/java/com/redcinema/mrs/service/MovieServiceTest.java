package com.redcinema.mrs.service;

import com.redcinema.mrs.dto.movie.MovieRequestDTO;
import com.redcinema.mrs.entity.Movie;
import com.redcinema.mrs.enums.Genre;
import com.redcinema.mrs.exception.MovieNotFoundException;
import com.redcinema.mrs.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MovieService unit tests")
class MovieServiceTest {

    @Mock MovieRepository movieRepository;
    @InjectMocks MovieService movieService;

    private Movie sampleMovie;
    private MovieRequestDTO sampleDto;

    @BeforeEach
    void setUp() {
        sampleMovie = Movie.builder()
                .movieId(1L)
                .movieName("Dune Part Two")
                .movieGenre(Genre.SCIENCE_FICTION)
                .movieDirector("Denis Villeneuve")
                .movieReleaseDate(LocalDate.of(2024, 3, 1))
                .movieDescription("Epic sci-fi continuation.")
                .movieDuration(167L)
                .totalBookings(0)
                .build();

        sampleDto = new MovieRequestDTO();
        sampleDto.setMovieName("Dune Part Two");
        sampleDto.setMovieGenre("SCIENCE_FICTION");
        sampleDto.setMovieDirector("Denis Villeneuve");
        sampleDto.setMovieReleaseDate(LocalDate.of(2024, 3, 1));
        sampleDto.setMovieDescription("Epic sci-fi continuation.");
        sampleDto.setMovieDuration(167L);
    }

    @Test
    @DisplayName("getAllMovies — returns page")
    void getAllMovies() {
        Page<Movie> page = new PageImpl<>(List.of(sampleMovie));
        when(movieRepository.findAll(any(PageRequest.class))).thenReturn(page);

        Page<Movie> result = movieService.getAllMovies(0, 10);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getMovieName()).isEqualTo("Dune Part Two");
    }

    @Test
    @DisplayName("getMovieById — returns movie when found")
    void getMovieById_found() {
        when(movieRepository.findById(1L)).thenReturn(Optional.of(sampleMovie));

        Movie result = movieService.getMovieById(1L);
        assertThat(result.getMovieId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("getMovieById — throws MovieNotFoundException when missing")
    void getMovieById_notFound() {
        when(movieRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> movieService.getMovieById(999L))
                .isInstanceOf(MovieNotFoundException.class);
    }

    @Test
    @DisplayName("createMovie — maps DTO correctly and saves")
    void createMovie_success() {
        when(movieRepository.save(any(Movie.class))).thenAnswer(inv -> inv.getArgument(0));

        Movie created = movieService.createMovie(sampleDto);

        assertThat(created.getMovieName()).isEqualTo("Dune Part Two");
        assertThat(created.getMovieGenre()).isEqualTo(Genre.SCIENCE_FICTION);
        assertThat(created.getTotalBookings()).isEqualTo(0);
        verify(movieRepository).save(any(Movie.class));
    }

    @Test
    @DisplayName("createMovie — throws IllegalArgumentException for invalid genre string")
    void createMovie_badGenre() {
        sampleDto.setMovieGenre("NOT_A_GENRE");
        assertThatThrownBy(() -> movieService.createMovie(sampleDto))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("updateMovie — updates fields and saves")
    void updateMovie_success() {
        when(movieRepository.findById(1L)).thenReturn(Optional.of(sampleMovie));
        when(movieRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        sampleDto.setMovieName("Dune: Part Two (Director's Cut)");
        Movie updated = movieService.updateMovie(1L, sampleDto);

        assertThat(updated.getMovieName()).isEqualTo("Dune: Part Two (Director's Cut)");
    }

    @Test
    @DisplayName("deleteMovie — calls repository deleteById")
    void deleteMovie_success() {
        when(movieRepository.findById(1L)).thenReturn(Optional.of(sampleMovie));
        doNothing().when(movieRepository).deleteById(1L);

        assertThatCode(() -> movieService.deleteMovie(1L)).doesNotThrowAnyException();
        verify(movieRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteMovie — throws when movie not found")
    void deleteMovie_notFound() {
        when(movieRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> movieService.deleteMovie(99L))
                .isInstanceOf(MovieNotFoundException.class);
        verify(movieRepository, never()).deleteById(any());
    }
}
