package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponse
{
    private Integer id;
    private String name;
    private Integer size;
    private String category;
    private String status;

    private Double currentPrice;

    private Integer bookingId;
    private Integer bookingRoomId;
    private Integer customerId;

    private String customerName;
    private String customerPhone;
    private LocalDateTime checkinTime;
    private LocalDateTime checkoutTime;

    private LocalDateTime reservationTime;

    private List<RoomStaffResponse> staffList;
}
