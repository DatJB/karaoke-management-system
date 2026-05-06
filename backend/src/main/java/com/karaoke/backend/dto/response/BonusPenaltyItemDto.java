package com.karaoke.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BonusPenaltyItemDto(
        Integer id,
        String itemType,
        String type,
        BigDecimal amount,
        String description,
        Integer bookingId,
        LocalDateTime createdAt,
        Integer employeeId,
        String employeeName
) {
}
