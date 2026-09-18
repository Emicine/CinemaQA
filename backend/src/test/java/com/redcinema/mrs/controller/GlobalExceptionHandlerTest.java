package com.redcinema.mrs.controller;

import com.redcinema.mrs.controller.advice.GlobalExceptionHandler;
import com.redcinema.mrs.exception.MovieNotFoundException;
import com.redcinema.mrs.exception.UserConflictException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GlobalExceptionHandler unit tests")
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("handleCustomException — preserves HTTP status and message")
    void handleCustomException_preservesStatus() {
        MovieNotFoundException ex =
                new MovieNotFoundException("Movie not found.", HttpStatus.NOT_FOUND);

        ResponseEntity<Map<String, Object>> response = handler.handleCustomException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).containsEntry("message", "Movie not found.");
        assertThat(response.getBody()).containsKey("timestamp");
        assertThat(response.getBody()).containsEntry("status", 404);
    }

    @Test
    @DisplayName("handleCustomException — 409 for UserConflictException")
    void handleCustomException_conflict() {
        UserConflictException ex =
                new UserConflictException("Duplicate user.", HttpStatus.CONFLICT);

        ResponseEntity<Map<String, Object>> response = handler.handleCustomException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).containsEntry("status", 409);
    }

    @Test
    @DisplayName("handleGeneric — returns 500 for unhandled exception")
    void handleGeneric_returns500() {
        RuntimeException ex = new RuntimeException("Unexpected failure");

        ResponseEntity<Map<String, Object>> response = handler.handleGeneric(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).containsEntry("status", 500);
    }
}
