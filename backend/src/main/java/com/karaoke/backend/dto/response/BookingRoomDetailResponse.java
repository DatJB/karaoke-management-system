package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRoomDetailResponse
{
    private Integer bookingRoomId;
    private Integer roomId;
    private String roomName;
    private String roomType;
    private String status;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
}
