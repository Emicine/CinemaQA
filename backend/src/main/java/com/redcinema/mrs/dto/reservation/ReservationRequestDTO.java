package com.redcinema.mrs.dto.reservation;

import com.redcinema.mrs.dto.showseat.ShowSeatRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ReservationRequestDTO {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "showId is required")
    private Long showId;

    @NotEmpty(message = "At least one seat must be selected")
    @Valid
    private List<ShowSeatRequestDTO> showSeats;
}
