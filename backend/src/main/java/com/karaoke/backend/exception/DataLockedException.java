package com.karaoke.backend.exception;

public class DataLockedException extends RuntimeException {
    public DataLockedException(String message) {
        super(message);
    }
}
