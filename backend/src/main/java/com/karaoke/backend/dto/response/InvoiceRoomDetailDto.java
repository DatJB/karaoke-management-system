package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRoomDetailDto
{
    private Integer id;
    private Integer bookingRoomId;
    private String roomName;
    private LocalDateTime checkinTime;
    private LocalDateTime checkoutTime;
    private BigDecimal hoursUsed;
    private BigDecimal pricePerHour;
    private BigDecimal totalAmount;

    private List<TimeSliceDto> priceBreakdowns;
}
