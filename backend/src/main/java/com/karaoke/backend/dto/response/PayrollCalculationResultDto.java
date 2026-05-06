package com.karaoke.backend.dto.response;

import java.math.BigDecimal;

/**
 * DTO representing the result of a bulk payroll calculation process.
 */
public record PayrollCalculationResultDto(
        String message,
        int calculatedPayrolls,
        BigDecimal totalAmount
) {}
