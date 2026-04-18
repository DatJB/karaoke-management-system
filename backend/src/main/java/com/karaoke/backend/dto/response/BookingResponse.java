package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse
{
    private Integer id;
    private String status;
    private LocalDateTime reservationTime;
    private LocalDateTime expectedCheckoutTime;
    private Integer roomCount;
    private String note;
}