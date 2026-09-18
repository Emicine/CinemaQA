package com.redcinema.mrs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(
    name = "theatre_vs_admin",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_theatre_admin", columnNames = {"theatre_id", "user_id"})
    }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class TheatreVsAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "theatre_id", nullable = false)
    @JsonIgnore
    private Theatre theatre;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TheatreVsAdmin that)) return false;
        return Objects.equals(id, that.id)
                && Objects.equals(theatre != null ? theatre.getTheatreId() : null,
                                  that.theatre != null ? that.theatre.getTheatreId() : null)
                && Objects.equals(user != null ? user.getUserId() : null,
                                  that.user != null ? that.user.getUserId() : null);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id,
                theatre != null ? theatre.getTheatreId() : null,
                user != null ? user.getUserId() : null);
    }
}
