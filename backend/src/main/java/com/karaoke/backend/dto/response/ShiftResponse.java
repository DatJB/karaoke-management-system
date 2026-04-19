package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalTime;

@Getter
@Builder
public class ShiftResponse
{
    private Integer id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
}
