package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class ScheduleResponse
{
    private Integer id;
    private LocalDate workDate;
    private String note;
    private Integer employeeId;
    private String employeeName;
    private String employeeCode;
    private Integer shiftId;
    private String shiftName;
    private LocalTime shiftStartTime;
    private LocalTime shiftEndTime;
}
