package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "weekly_insight_reports")
@Data
public class WeeklyInsightReport
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer weekNumber;
    private Integer reportYear;
    private LocalDate startDate;
    private LocalDate endDate;

    private Integer totalFeedbacks;
    private Double averageRating;
    private Double averageSentimentScore;
    private Integer positiveCount;
    private Integer negativeCount;

    @Column(columnDefinition = "TEXT")
    private String topIssuesSummary;

    @Column(columnDefinition = "TEXT")
    private String weeklyActionPlan;
}