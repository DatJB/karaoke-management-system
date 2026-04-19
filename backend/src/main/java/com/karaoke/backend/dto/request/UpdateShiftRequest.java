package com.karaoke.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class UpdateShiftRequest
{
    @NotBlank(message = "Ten ca khong duoc de trong")
    private String name;

    @NotNull(message = "Gio bat dau khong duoc de trong")
    private LocalTime startTime;

    @NotNull(message = "Gio ket thuc khong duoc de trong")
    private LocalTime endTime;
}
