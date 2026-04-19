package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class RoomPriceSpecialResponse {
    private Integer id;
    private Integer roomId;
    private String roomName;
    private LocalDate specialDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal pricePerHour;
    private String note;
}
