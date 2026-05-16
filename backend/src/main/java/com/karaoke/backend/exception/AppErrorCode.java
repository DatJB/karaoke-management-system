package com.karaoke.backend.exception;

import org.springframework.http.HttpStatus;

public enum AppErrorCode {
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng trong hệ thống"),
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "Sản phẩm này không tồn tại"),
    INVALID_DATA(HttpStatus.BAD_REQUEST, "Dữ liệu đầu vào không hợp lệ"),
    SYSTEM_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Hệ thống đang bảo trì, vui lòng thử lại sau");

    private final HttpStatus statusCode;
    private final String message;

    AppErrorCode(HttpStatus statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }

    public HttpStatus getStatusCode() { return statusCode; }
    public String getMessage() { return message; }
}