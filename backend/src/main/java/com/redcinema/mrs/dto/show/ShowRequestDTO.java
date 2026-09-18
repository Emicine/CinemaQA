package com.redcinema.mrs.dto.show;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShowRequestDTO {

    @NotNull(message = "movieId is required")
    private Long movieId;

    @NotNull(message = "screenId is required")
    private Long screenId;

    @NotNull(message = "startTime is required")
    private LocalDateTime startTime;

    @NotNull(message = "endTime is required")
    private LocalDateTime endTime;
}
