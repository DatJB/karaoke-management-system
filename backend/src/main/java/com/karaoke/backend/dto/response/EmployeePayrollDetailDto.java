package com.karaoke.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record EmployeePayrollDetailDto(
        Integer employeeId,
        String employeeName,
        String role,
        Summary summary,
        List<ServiceHistory> serviceHistory,
        List<PenaltyResponseDto> otherPenalties,
        List<BonusResponseDto> bonuses
) {
    public record Summary(
            BigDecimal baseSalary,
            BigDecimal totalWorkHours,
            BigDecimal salaryFromHours,
            BigDecimal totalBonus,
            BigDecimal totalPenalty,
            BigDecimal totalSalary
    ) {}

    public record ServiceHistory(
            Integer bookingId,
            Integer roomId,
            String roomName,
            LocalDateTime checkInTime,
            LocalDateTime checkOutTime,
            BigDecimal durationHours,
            BigDecimal earnedAmount,
            List<PenaltyResponseDto> penalties
    ) {}
}
