package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimeSliceDto {
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal pricePerHour;
    private BigDecimal hours;
    private BigDecimal amount;
}