package com.redcinema.mrs.exception;

import org.springframework.http.HttpStatus;

public class ScreenNotFoundException extends CustomException {
    public ScreenNotFoundException(String message, HttpStatus httpStatus) {
        super(message, httpStatus);
    }
}
