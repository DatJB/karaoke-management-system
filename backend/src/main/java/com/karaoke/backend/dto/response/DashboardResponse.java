package com.karaoke.backend.dto.response;

import com.karaoke.backend.entity.RoomPrice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private BigDecimal todayTotalRevenue;
    private Long todayTotalBookings;
    private Long activeRooms;
    private Long todayTotalCustomers;
    private Double revenueChange;
    private Double bookingsChange;
    private Double customersChange;
    private List<WeeklyRevenue> thisWeekRevenue;
    private List<RecentActivity> recentActivities;

    @Data
    @AllArgsConstructor
    @Builder
    public static class WeeklyRevenue {
        private String dayOfWeek;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    public static class RecentActivity {
        private String description;
        private LocalDateTime timestamp;
        private Activity type;
    }

    public enum Activity {
        BOOKING,
        PAYMENT,
        FEEDBACK
    }

}
