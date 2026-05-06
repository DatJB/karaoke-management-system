package com.karaoke.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PenaltyResponseDto(
        Integer penaltyId,
        String type,
        BigDecimal amount,
        String reason,
        Integer bookingId,
        LocalDateTime createdAt
) {}
