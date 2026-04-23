package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ServingRoomResponse {
    private Integer roomId;
    private String roomName;
    private String roomCategory;
    private Integer bookingId;
    private String customerName;
    private LocalDateTime checkInTime;
    private Integer roomSize;
    private String roomStatus;
    private String status;
}
