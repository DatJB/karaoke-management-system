package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PricingCalculationResult {
    private BigDecimal totalCost = BigDecimal.ZERO;
    private BigDecimal totalHours = BigDecimal.ZERO;
    private List<TimeSliceDto> slices = new ArrayList<>();
}