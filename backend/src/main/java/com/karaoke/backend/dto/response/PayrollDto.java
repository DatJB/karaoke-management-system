package com.karaoke.backend.dto.response;

import java.math.BigDecimal;

import java.time.LocalDate;

public record PayrollDto(
        Integer id,
        Integer periodId,
        String periodName,
        LocalDate periodStart,
        LocalDate periodEnd,
        Integer employeeId,
        String employeeName,
        String role,
        BigDecimal totalWorkHours,
        BigDecimal baseSalary,
        BigDecimal salaryFromHours,
        BigDecimal totalBonus,
        BigDecimal totalPenalty,
        BigDecimal totalSalary,
        String status
) {}
