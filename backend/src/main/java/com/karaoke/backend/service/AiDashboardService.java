package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.AiDashboardResponse;

import java.time.LocalDate;

public interface AiDashboardService
{
    AiDashboardResponse getDashboardData(LocalDate startDate, LocalDate endDate, int page, int size, String sortBy);
}
