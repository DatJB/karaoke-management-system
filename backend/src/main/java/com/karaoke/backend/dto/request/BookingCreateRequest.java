package com.karaoke.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BookingCreateRequest {

    @NotNull(message = "ID khách hàng không được để trống")
    private Integer customerId;

    @NotNull(message = "Giờ nhận phòng dự kiến không được để trống")
    private LocalDateTime reservationTime;

    @NotNull(message = "Giờ trả phòng dự kiến không được để trống")
    private LocalDateTime expectedCheckoutTime;

    private String note;

    @NotEmpty(message = "Vui lòng chọn ít nhất 1 phòng để đặt!")
    private List<Integer> roomIds;

    private boolean checkInImmediately = false;
}