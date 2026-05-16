package com.karaoke.backend.dto.request;

import java.math.BigDecimal;

public record BonusRequestDto(
        Integer employeeId,
        String type,
        BigDecimal amount,
        String note,
        Integer bookingId
) {}
