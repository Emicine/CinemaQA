package com.redcinema.mrs.dto.theatre;

import com.redcinema.mrs.dto.screen.ScreenRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class TheatreRequestDTO {

    @NotBlank(message = "Theatre name is required")
    private String theatreName;

    @NotBlank(message = "Theatre location is required")
    private String theatreLocation;

    @NotNull(message = "Theatre admin ID is required")
    private Long theatreAdminId;

    @NotEmpty(message = "At least one screen is required")
    @Valid
    private List<ScreenRequestDTO> screens;
}
