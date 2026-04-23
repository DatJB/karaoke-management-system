package com.karaoke.backend.dto.request;

import com.karaoke.backend.entity.RoomPrice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyPriceRequest {
    private Integer id; // Thêm trường ID để update chính xác bản ghi
    private RoomPrice.DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal pricePerHour;
}
