package com.redcinema.mrs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "theatre")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Theatre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long theatreId;

    @Column(nullable = false, length = 150)
    private String theatreName;

    @Column(nullable = false, length = 200)
    private String theatreLocation;

    @Builder.Default
    private Integer totalScreens = 0;

    @Builder.Default
    private Integer totalBookings = 0;

    @Builder.Default
    private Double totalRevenue = 0.0;

    @OneToMany(
            mappedBy = "theatre",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnore
    @Builder.Default
    private List<TheatreVsAdmin> theatreAdmins = new ArrayList<>();

    @OneToMany(
            mappedBy = "theatre",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnore
    @Builder.Default
    private List<Show> shows = new ArrayList<>();

    @OneToMany(
            mappedBy = "theatre",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    @Builder.Default
    private List<Screen> screens = new ArrayList<>();
}