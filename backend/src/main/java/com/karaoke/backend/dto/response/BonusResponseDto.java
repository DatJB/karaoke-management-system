package com.karaoke.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BonusResponseDto(
        Integer bonusId,
        String type,
        BigDecimal amount,
        String note,
        LocalDateTime createdAt
) {}
