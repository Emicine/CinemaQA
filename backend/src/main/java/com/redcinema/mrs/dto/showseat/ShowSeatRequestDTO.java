package com.redcinema.mrs.dto.showseat;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShowSeatRequestDTO {
    @NotNull(message = "seatId is required")
    private Long seatId;
}
