package com.karaoke.backend.controller;

import com.karaoke.backend.dto.response.RevenueResponse;
import com.karaoke.backend.service.ai.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticController {

    private final RevenueService statisticService;

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<RevenueResponse> getRevenueStats(
            @RequestParam(required = false) Integer year)
    {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        return ResponseEntity.ok(statisticService.getRevenueStats(year));
    }
}
