package com.karaoke.backend.dto.response;

import com.karaoke.backend.entity.RoomPrice;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class RoomPricingResponse {
    private List<RoomInfo> rooms;

    @Data
    @Builder
    public static class RoomInfo {
        private Integer id;
        private String name;
        private String category;
        private List<PriceSlotInfo> prices;
    }

    @Data
    @Builder
    public static class PriceSlotInfo {
        private Integer id;
        private RoomPrice.DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private BigDecimal pricePerHour;
    }
}
