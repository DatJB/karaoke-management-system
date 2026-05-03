package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RoomEmployeeResponse
{
    private Integer id;
    private Integer roomId;
    private Integer employeeId;
    private String employeeCode;
    private String employeeName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
