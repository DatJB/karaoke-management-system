package com.karaoke.backend.dto.request;

import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

public record PayrollUpdateRequestDto(
        @Min(0) BigDecimal baseSalary,
        @Min(0) BigDecimal salaryFromHours,
        @Min(0) BigDecimal totalBonus,
        @Min(0) BigDecimal totalPenalty
) {
}
