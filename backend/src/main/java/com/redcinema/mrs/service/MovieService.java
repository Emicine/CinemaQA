package com.redcinema.mrs.service;

import com.redcinema.mrs.constants.ExceptionConstants;
import com.redcinema.mrs.dto.movie.MovieRequestDTO;
import com.redcinema.mrs.entity.Movie;
import com.redcinema.mrs.enums.Genre;
import com.redcinema.mrs.exception.MovieNotFoundException;
import com.redcinema.mrs.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;

    // ── Read ─────────────────────────────────────────────────────────────────

    public Page<Movie> getAllMovies(int page, int pageSize) {
        return movieRepository.findAll(PageRequest.of(page, pageSize));
    }

    public Movie getMovieById(Long movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new MovieNotFoundException(
                        ExceptionConstants.MOVIE_NOT_FOUND, HttpStatus.NOT_FOUND));
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public Movie createMovie(MovieRequestDTO dto) {
        Movie movie = Movie.builder()
                .movieName(dto.getMovieName())
                .movieGenre(Genre.valueOf(dto.getMovieGenre()))
                .movieDirector(dto.getMovieDirector())
                .movieReleaseDate(dto.getMovieReleaseDate())
                .movieDescription(dto.getMovieDescription())
                .movieDuration(dto.getMovieDuration())
                .moviePosterUrl(dto.getMoviePosterUrl())
                .totalBookings(0)
                .build();
        return movieRepository.save(movie);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public Movie updateMovie(Long movieId, MovieRequestDTO dto) {
        Movie movie = getMovieById(movieId);
        movie.setMovieName(dto.getMovieName());
        movie.setMovieGenre(Genre.valueOf(dto.getMovieGenre()));
        movie.setMovieDirector(dto.getMovieDirector());
        movie.setMovieReleaseDate(dto.getMovieReleaseDate());
        movie.setMovieDescription(dto.getMovieDescription());
        movie.setMovieDuration(dto.getMovieDuration());
        movie.setMoviePosterUrl(dto.getMoviePosterUrl());
        return movieRepository.save(movie);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteMovie(Long movieId) {
        getMovieById(movieId);
        movieRepository.deleteById(movieId);
    }
}
