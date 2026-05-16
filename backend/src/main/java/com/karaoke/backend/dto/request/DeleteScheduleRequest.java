package com.karaoke.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DeleteScheduleRequest
{
    @NotNull(message = "ID nhân viên không được để trống")
    private Integer employeeId;

    @NotNull(message = "ID ca làm không được để trống")
    private Integer shiftId;

    @NotNull(message = "Ngày làm không được để trống")
    private LocalDate workDate;
}
