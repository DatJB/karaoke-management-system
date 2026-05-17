package com.karaoke.backend.service.ai;

import java.time.LocalDateTime;

public interface EmployeeAnalyticsService
{
    String getTotalPayroll(LocalDateTime start, LocalDateTime end);

    String getTopPerformingEmployees(LocalDateTime start, LocalDateTime end, int limit);

    String getEmployeeFeedbackIssues(LocalDateTime start, LocalDateTime end);

    String getAttendanceIssues(LocalDateTime start, LocalDateTime end);

   String getEmployeePenalties(LocalDateTime start, LocalDateTime end);
}
