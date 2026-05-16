package com.karaoke.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackCreateRequest {

    @NotNull(message = "ID hóa đơn không được để trống")
    private Integer invoiceId;

    @NotNull(message = "Số sao đánh giá không được để trống")
    private Double rating;

    private String comment;
}
