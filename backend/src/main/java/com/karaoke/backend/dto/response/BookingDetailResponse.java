package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BookingDetailResponse
{
    private Integer id;
    private Integer customerId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime reservationTime;
    private LocalDateTime expectedCheckoutTime;
    private String note;

    private List<BookingRoomDetailResponse> roomDetails;
}
