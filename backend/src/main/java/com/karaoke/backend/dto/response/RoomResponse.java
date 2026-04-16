package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
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

    private List<RoomStaffResponse> staffList;
}
