package com.karaoke.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateScheduleRequest
{
    @NotNull(message = "Employee id khong duoc de trong")
    private Integer employeeId;

    @NotNull(message = "Shift id khong duoc de trong")
    private Integer shiftId;

    @NotNull(message = "Ngay lam khong duoc de trong")
    private LocalDate workDate;

    private String note;
}
