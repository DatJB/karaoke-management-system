package com.karaoke.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RoomPriceSpecialRequest {
    private LocalDate specialDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal pricePerHour;
    private String note;
}
