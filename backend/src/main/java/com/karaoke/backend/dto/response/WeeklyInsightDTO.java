package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class WeeklyInsightDTO
{
    private Integer id;

    private Integer weekNumber;
    private Integer reportYear;
    private String dateRange; // startDate - endDate

    private Integer totalFeedbacks;
    private Double averageRating;
    private Double averageSentimentScore;

    private Integer positiveCount;
    private Integer negativeCount;
    private Double positivePercentage;

    private String topIssuesSummary;
    private List<String> weeklyActionPlan;
}
