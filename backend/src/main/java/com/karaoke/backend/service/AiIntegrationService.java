package com.karaoke.backend.service;

import java.time.LocalDate;
import java.util.List;

public interface AiIntegrationService
{
    void analyzeFeedbackAsync(Integer feedbackId, String comment);

    void generateDailyReport(LocalDate date, List<String> comment);

    void generateWeeklyReport(LocalDate dayInWeek);
}
