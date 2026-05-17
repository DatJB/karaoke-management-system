package com.karaoke.backend.service.ai;

import java.time.LocalDateTime;

public interface CustomerAnalyticsService
{
    String getTopSpenders(LocalDateTime start, LocalDateTime end);

    String getMostFrequentCustomers(LocalDateTime start, LocalDateTime end);

    String getSleepingCustomers(LocalDateTime cutoffDate);
}
