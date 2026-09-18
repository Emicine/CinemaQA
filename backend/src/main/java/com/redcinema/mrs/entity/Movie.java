package com.redcinema.mrs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.redcinema.mrs.enums.Genre;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "movie")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long movieId;

    @Column(nullable = false, length = 150)
    private String movieName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Genre movieGenre;

    @Column(nullable = false, length = 100)
    private String movieDirector;

    private LocalDate movieReleaseDate;

    @Column(columnDefinition = "TEXT")
    private String movieDescription;

    /** Duration in minutes */
    private Long movieDuration;

    @Column(length = 500)
    private String moviePosterUrl;

    @Builder.Default
    private Integer totalBookings = 0;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private List<Show> shows = new ArrayList<>();
}
