package com.karaoke.backend.dto;

import java.math.BigDecimal;

public record PenaltyRequestDto(
        Integer employeeId,
        String type,
        BigDecimal amount,
        String reason,
        Integer bookingId
) {}
