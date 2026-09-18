package com.redcinema.mrs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.redcinema.mrs.enums.SeatType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "seat",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_screen_row_seat", columnNames = {"screen_id", "row_id", "seat_number"})
    }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seatId;

    @Column(name = "row_id", nullable = false)
    private Integer rowId;

    @Column(nullable = false)
    private Integer seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SeatType seatType;

    @Column(nullable = false)
    private Double seatPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screen_id", nullable = false)
    @JsonIgnore
    private Screen screen;
}
