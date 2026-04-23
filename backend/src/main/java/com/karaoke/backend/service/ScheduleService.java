package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.CreateScheduleRequest;
import com.karaoke.backend.dto.request.DeleteScheduleRequest;
import com.karaoke.backend.dto.response.ScheduleResponse;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleService
{
    List<ScheduleResponse> getSchedules(LocalDate fromDate, LocalDate toDate);

    ScheduleResponse createSchedule(CreateScheduleRequest request);

    void deleteSchedule(DeleteScheduleRequest request);

    List<ScheduleResponse> getMySchedules(LocalDate fromDate, LocalDate toDate);
}
