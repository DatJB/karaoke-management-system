package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.FeedbackCreateRequest;

public interface FeedbackService
{
    void submitFeedback(FeedbackCreateRequest request);
}
