package com.karaoke.backend.controller;

import com.karaoke.backend.dto.response.AiDashboardResponse;
import com.karaoke.backend.dto.response.WeeklyInsightDTO;
import com.karaoke.backend.entity.WeeklyInsightReport;
import com.karaoke.backend.service.AiDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(defaultValue = "LATEST") String sortBy,
            @RequestParam(required = false) String sentiment)
    {
        if (startDate == null || endDate == null)
        {
            endDate = LocalDate.now();
            startDate = endDate.minusDays(7);
        }

        AiDashboardResponse response = dashboardService.getDashboardData(startDate, endDate, page, size, sortBy, sentiment);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/weekly")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<WeeklyInsightDTO> getWeeklyReport(
            @RequestParam Integer week,
            @RequestParam Integer year)
    {
        return ResponseEntity.ok(dashboardService.getWeeklyReport(week, year).orElse(null));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<String> generateReport(
            @RequestParam String type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date)
    {
        try {
            dashboardService.generateReport(type, date);
            return ResponseEntity.ok("Tổng hợp thành công!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống khi tổng hợp báo cáo: " + e.getMessage());
        }
    }
}
