package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.RevenueResponse;

public interface StatisticService {
    RevenueResponse getRevenueStats(int year);
}
