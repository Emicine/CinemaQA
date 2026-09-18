package com.redcinema.mrs.dto.screen;

import com.redcinema.mrs.dto.seat.SeatRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ScreenRequestDTO {

    @NotBlank(message = "Screen name is required")
    private String screenName;

    @NotEmpty(message = "At least one seat is required")
    @Valid
    private List<SeatRequestDTO> seats;
}
