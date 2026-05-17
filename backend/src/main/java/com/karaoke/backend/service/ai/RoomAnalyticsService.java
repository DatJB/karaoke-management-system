package com.karaoke.backend.service.ai;

public interface RoomAnalyticsService
{
    String getWorstRoomsInPeriod(String startDateStr, String endDateStr);

    String getBestRoomsInPeriod(String startDateStr, String endDateStr);

    String getRoomUtilization(String startDateStr, String endDateStr);

    String getRoomRevenueRanking(String startDateStr, String endDateStr);
}
