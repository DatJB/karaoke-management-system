package com.karaoke.backend.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(AppErrorCode errorCode) {
        super(errorCode.getMessage());
    }
}