package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.CreateScheduleRequest;
import com.karaoke.backend.dto.request.DeleteScheduleRequest;
import com.karaoke.backend.dto.response.ScheduleResponse;
import com.karaoke.backend.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleController
{
    private final ScheduleService scheduleService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public List<ScheduleResponse> getSchedules(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        return scheduleService.getSchedules(fromDate, toDate);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ScheduleResponse createSchedule(
            @Valid @RequestBody CreateScheduleRequest request
    ) {
        return scheduleService.createSchedule(request);
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public Map<String, String> deleteSchedule(
            @Valid @RequestBody DeleteScheduleRequest request
    ) {
        scheduleService.deleteSchedule(request);
        return Map.of("message", "Xoa phan cong thanh cong");
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','STAFF')")
    public List<ScheduleResponse> getMySchedules(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        return scheduleService.getMySchedules(fromDate, toDate);
    }
}
