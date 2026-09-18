package com.redcinema.mrs.exception;

import org.springframework.http.HttpStatus;

public class AvailableShowSeatsNotFoundException extends CustomException {
    public AvailableShowSeatsNotFoundException(String message, HttpStatus httpStatus) {
        super(message, httpStatus);
    }
}
