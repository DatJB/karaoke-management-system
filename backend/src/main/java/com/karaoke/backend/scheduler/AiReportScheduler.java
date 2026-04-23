package com.karaoke.backend.scheduler;

import com.karaoke.backend.entity.Feedback;
import com.karaoke.backend.repository.FeedbackRepository;
import com.karaoke.backend.service.AiIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AiReportScheduler
{
    private final FeedbackRepository feedbackRepository;
    private final AiIntegrationService aiIntegrationService;

    @Scheduled(cron = "0 0 3 * * ?")
    public void runDailyAiAnalysis()
    {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDateTime start = yesterday.atTime(8, 0, 0);
        LocalDateTime end = today.atTime(3, 0, 0);

        List<Feedback> feedbacks = feedbackRepository.findByCreatedAtBetween(start, end);

        if (feedbacks.isEmpty()) return;

        List<String> comments = feedbacks.stream()
                .map(Feedback::getComment)
                .filter(c -> c != null && !c.isBlank())
                .toList();

        if (comments.isEmpty()) return;

        aiIntegrationService.generateDailyReport(yesterday, comments);
    }
}