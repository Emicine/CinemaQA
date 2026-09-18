package com.redcinema.mrs.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class APIResponseDTO {
    private String message;
    private Object data;
}
