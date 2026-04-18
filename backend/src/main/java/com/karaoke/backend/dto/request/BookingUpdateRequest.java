package com.karaoke.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingUpdateRequest
{
    @NotNull(message = "Giờ nhận phòng dự kiến không được để trống")
    private LocalDateTime reservationTime;

    @NotNull(message = "Giờ trả phòng dự kiến không được để trống")
    private LocalDateTime expectedCheckoutTime;

    private String note;
}
