package com.karaoke.backend.service.ai;

import com.karaoke.backend.dto.response.RevenueBreakdownDto;
import com.karaoke.backend.dto.response.RevenueResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface RevenueService
{
    RevenueResponse getRevenueStats(int year);

    BigDecimal getRevenueByMonth(int month);

    String getPeakHoursInPeriod(LocalDateTime start, LocalDateTime end);

    RevenueBreakdownDto getRevenueBreakdown(LocalDateTime start, LocalDateTime end);

    List<String> getTopSellingItems(LocalDateTime start, LocalDateTime end, int limit);
}
