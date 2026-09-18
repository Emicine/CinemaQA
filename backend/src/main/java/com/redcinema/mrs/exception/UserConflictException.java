package com.redcinema.mrs.exception;

import org.springframework.http.HttpStatus;

public class UserConflictException extends CustomException {
    public UserConflictException(String message, HttpStatus httpStatus) {
        super(message, httpStatus);
    }
}
