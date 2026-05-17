package com.karaoke.backend.service.ai.impl;

import com.karaoke.backend.entity.Feedback;
import com.karaoke.backend.entity.FeedbackTag;
import com.karaoke.backend.repository.*;
import com.karaoke.backend.service.ai.EmployeeAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeAnalyticsServiceImpl implements EmployeeAnalyticsService
{
    private final PayrollRepository payrollRepository;
    private final BookingRoomEmployeeRepository serviceOrderRepository;
    private final FeedbackRepository feedbackRepository;
    private final PenaltyRepository penaltyRepository;

    @Override
    public String getTotalPayroll(LocalDateTime start, LocalDateTime end)
    {
        BigDecimal totalPayroll = payrollRepository.calculateTotalPayroll(start, end);

        if (totalPayroll == null || totalPayroll.compareTo(BigDecimal.ZERO) == 0)
        {
            return null;
        }
        return "- Tổng chi phí lương: " + totalPayroll.toString() + " VNĐ";
    }

    @Override
    public String getTopPerformingEmployees(LocalDateTime start, LocalDateTime end, int limit)
    {
        List<Object[]> results = serviceOrderRepository.findTopPerformingEmployees(start, end, PageRequest.of(0, limit));

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> String.format("- Nhân viên %s: Phục vụ %d lượt", row[0], (Long) row[1]))
                .collect(Collectors.joining("\n"));
    }

    @Override
    public String getEmployeeFeedbackIssues(LocalDateTime start, LocalDateTime end)
    {
        List<Object[]> results = feedbackRepository.findEmployeeNegativeFeedbacks(start, end, FeedbackTag.SystemTag.SERVICE);

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> String.format("- Nhân viên %s: Khách phàn nàn \"%s\" (Điểm: %s sao)",
                        row[0], row[1], row[2].toString()))
                .collect(Collectors.joining("\n"));
    }

    @Override
    public String getAttendanceIssues(LocalDateTime start, LocalDateTime end)
    {
        List<Object[]> results = penaltyRepository.findAttendanceIssues(start, end);

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> {
                    String statusStr = row[1].toString().equals("LATE") ? "Đi muộn" : "Nghỉ không phép";
                    return String.format("- Nhân viên %s: %s (%d lần)", row[0], statusStr, (Long) row[2]);
                })
                .collect(Collectors.joining("\n"));
    }

    @Override
    public String getEmployeePenalties(LocalDateTime start, LocalDateTime end)
    {
        List<Object[]> results = penaltyRepository.findOperationalPenalties(start, end);

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> {
                    String typeStr = row[1].toString();
                    // Dịch tên lỗi cho AI dễ đọc
                    if (typeStr.equals("MISCONDUCT")) typeStr = "Vi phạm thái độ/nội quy";
                    else if (typeStr.equals("BOOKING")) typeStr = "Lỗi đặt phòng/Order";
                    else typeStr = "Lỗi chung";

                    return String.format("- Nhân viên %s: Mắc %s (%d lần)", row[0], typeStr, (Long) row[2]);
                })
                .collect(Collectors.joining("\n"));
    }
}
