package com.redcinema.mrs.dto.user;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TheatreAdminRequestDTO {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "theatreId is required")
    private Long theatreId;
}
