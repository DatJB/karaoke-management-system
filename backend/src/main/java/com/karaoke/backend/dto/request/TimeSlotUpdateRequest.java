package com.karaoke.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotUpdateRequest {
    private LocalTime oldStartTime;
    private LocalTime oldEndTime;
    private LocalTime newStartTime;
    private LocalTime newEndTime;
}
