package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
public class RevenueBreakdownDto
{
        private BigDecimal roomRevenue;
        private BigDecimal serviceRevenue;
        private BigDecimal totalRevenue;
}