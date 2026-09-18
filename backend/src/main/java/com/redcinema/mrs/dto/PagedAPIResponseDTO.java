package com.redcinema.mrs.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PagedAPIResponseDTO {
    private List<?> pageData;
    private long totalElements;
    private int totalPages;
    private int currentLimit;
}
