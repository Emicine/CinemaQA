package com.redcinema.mrs.dto.seat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class SeatRequestDTO {

    @NotNull(message = "rowId is required")
    @Positive
    private Integer rowId;

    @NotNull(message = "seatNumber is required")
    @Positive
    private Integer seatNumber;

    @NotBlank(message = "seatType is required")
    private String seatType;   // maps to SeatType enum

    @NotNull(message = "seatPrice is required")
    @PositiveOrZero
    private Double seatPrice;
}
