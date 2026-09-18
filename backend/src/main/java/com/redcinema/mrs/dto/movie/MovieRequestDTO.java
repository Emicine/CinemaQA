package com.redcinema.mrs.dto.movie;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MovieRequestDTO {

    @NotBlank(message = "Movie name is required")
    @Size(max = 150)
    private String movieName;

    @NotBlank(message = "Genre is required")
    private String movieGenre;

    @NotBlank(message = "Director is required")
    @Size(max = 100)
    private String movieDirector;

    @NotNull(message = "Release date is required")
    private LocalDate movieReleaseDate;

    @Size(max = 2000)
    private String movieDescription;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Long movieDuration;

    @Size(max = 500)
    private String moviePosterUrl;
}
