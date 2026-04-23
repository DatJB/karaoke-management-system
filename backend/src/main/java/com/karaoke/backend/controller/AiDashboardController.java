package com.karaoke.backend.controller;

import com.karaoke.backend.dto.response.AiDashboardResponse;
import com.karaoke.backend.service.AiDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/ai-insights")
@RequiredArgsConstructor
public class AiDashboardController
{
    private final AiDashboardService dashboardService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AiDashboardResponse> getDashboardData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "LATEST") String sortBy)
    {
        if (startDate == null || endDate == null)
        {
            endDate = LocalDate.now();
            startDate = endDate.minusDays(7);
        }

        AiDashboardResponse response = dashboardService.getDashboardData(startDate, endDate, page, size, sortBy);
        return ResponseEntity.ok(response);
    }
}
