package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.FeedbackCreateRequest;
import com.karaoke.backend.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<String> submitFeedback(@Valid @RequestBody FeedbackCreateRequest request) {

        feedbackService.submitFeedback(request);
        return ResponseEntity.ok("Đã ghi nhận đánh giá của khách hàng!");
    }
}