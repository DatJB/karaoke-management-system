package com.karaoke.backend.controller;

import com.karaoke.backend.entity.AuditLog;
import com.karaoke.backend.repository.AuditLogRepository;
import com.karaoke.backend.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        
        LocalDateTime startDateTime = null;
        if (startDate != null) {
            startDateTime = startDate.atStartOfDay(); // 00:00:00
        }
        
        LocalDateTime endDateTime = null;
        if (endDate != null) {
            endDateTime = endDate.atTime(LocalTime.MAX); // 23:59:59.999
        }

        // Dọn dẹp chuỗi rỗng
        String usernameQuery = (username != null && !username.trim().isEmpty()) ? username.trim() : null;
        String methodQuery = (method != null && !method.trim().isEmpty()) ? method.trim() : null;

        Page<AuditLog> logs = auditLogRepository.filterLogs(
                usernameQuery,
                methodQuery,
                startDateTime,
                endDateTime,
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(new ApiResponse<>("Success", logs));
    }
}
