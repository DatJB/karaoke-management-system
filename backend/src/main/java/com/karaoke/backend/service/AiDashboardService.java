package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.AiDashboardResponse;
import com.karaoke.backend.dto.response.WeeklyInsightDTO;

import java.time.LocalDate;
import java.util.Optional;

public interface AiDashboardService
{
    AiDashboardResponse getDashboardData(LocalDate startDate, LocalDate endDate, int page, int size, String sortBy, String sentiment);

    Optional<WeeklyInsightDTO> getWeeklyReport(Integer week, Integer year);

    void generateReport(String type, LocalDate date);
}
