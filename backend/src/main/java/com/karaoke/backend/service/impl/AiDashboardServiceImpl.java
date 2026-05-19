package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.response.*;
import com.karaoke.backend.entity.AiInsightReport;
import com.karaoke.backend.entity.Feedback;
import com.karaoke.backend.entity.FeedbackTag;
import com.karaoke.backend.repository.AiInsightReportRepository;
import com.karaoke.backend.repository.FeedbackRepository;
import com.karaoke.backend.repository.WeeklyInsightReportRepository;
import com.karaoke.backend.service.AiDashboardService;
import com.karaoke.backend.service.AiIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.karaoke.backend.entity.AiInsightReport.Category.*;

@Service
@RequiredArgsConstructor
public class AiDashboardServiceImpl implements AiDashboardService
{
    private final FeedbackRepository feedbackRepository;
    private final AiInsightReportRepository insightRepository;
    private final WeeklyInsightReportRepository weeklyInsightReportRepository;
    private final AiIntegrationService aiIntegrationService;

    @Override
    public AiDashboardResponse getDashboardData(LocalDate startDate, LocalDate endDate, int page, int size, String sortBy, String sentiment)
    {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        Double avgRating = feedbackRepository.getAverageRating(start, end);
        double satisfactionScore = Math.round(avgRating * 10.0) / 10.0;

        SentimentIndex sentimentIndex = calculateSentimentIndex(start, end);

        List<AiInsightReport> rawReports = insightRepository.findByReportDateBetweenOrderByCreatedAtDesc(startDate, endDate);
        List<ActionableInsight> insights = rawReports.stream()
                .map(this::mapToActionableInsight)
                .collect(Collectors.toList());

        Sort sort = "LATEST".equalsIgnoreCase(sortBy)
                ? Sort.by(Sort.Direction.DESC, "createdAt")
                : Sort.by(Sort.Direction.ASC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Feedback> feedbackPage;
        if (sentiment != null && !"LATEST".equalsIgnoreCase(sentiment) && !"ALL".equalsIgnoreCase(sentiment)) {
            feedbackPage = feedbackRepository.findBySentimentLabelAndCreatedAtBetween(
                    Feedback.SentimentLabel.valueOf(sentiment.toUpperCase()), start, end, pageable);
        } else {
            feedbackPage = feedbackRepository.findByCreatedAtBetween(start, end, pageable);
        }
        
        Page<LiveFeedback> liveFeedbacks = feedbackPage.map(this::mapToLiveFeedback);

        return AiDashboardResponse.builder()
                .satisfactionScore(satisfactionScore)
                .sentimentIndex(sentimentIndex)
                .actionableInsights(insights)
                .liveFeedbacks(NewPageResponse.from(liveFeedbacks))
                .build();
    }

    private SentimentIndex calculateSentimentIndex(LocalDateTime start, LocalDateTime end)
    {
        long total = feedbackRepository.countByCreatedAtBetween(start, end);

        if (total == 0)
        {
            return SentimentIndex.builder()
                    .positivePercent(0.0)
                    .neutralPercent(0.0)
                    .negativePercent(0.0)
                    .build();
        }

        long positive = feedbackRepository.countBySentimentLabelAndCreatedAtBetween(Feedback.SentimentLabel.POSITIVE, start, end);
        long neutral = feedbackRepository.countBySentimentLabelAndCreatedAtBetween(Feedback.SentimentLabel.NEUTRAL, start, end);
        long negative = feedbackRepository.countBySentimentLabelAndCreatedAtBetween(Feedback.SentimentLabel.NEGATIVE, start, end);

        return SentimentIndex.builder()
                .positivePercent(Math.round((positive * 100.0 / total) * 10.0) / 10.0)
                .neutralPercent(Math.round((neutral * 100.0 / total) * 10.0) / 10.0)
                .negativePercent(Math.round((negative * 100.0 / total) * 10.0) / 10.0)
                .build();
    }

    private ActionableInsight mapToActionableInsight(AiInsightReport report) {
        return ActionableInsight.builder()
                .id(report.getId())
                .title(report.getInsightTitle())
                .content(report.getInsightContent())
                .solution(report.getSolution())
                .severityLevel(report.getSeverityLevel() != null ? report.getSeverityLevel().name() : "LOW")
                .build();
    }

    private LiveFeedback mapToLiveFeedback(Feedback feedback)
    {
        String customerName = "Khách hàng";
        if (feedback.getInvoice() != null && feedback.getInvoice().getBooking().getCustomer() != null)
        {
            customerName = feedback.getInvoice().getBooking().getCustomer().getName();
        }

        List<String> displayTags = feedback.getExtractedTags() == null
                ? List.of()
                : feedback.getExtractedTags().stream()
                .map(FeedbackTag::getExtractedTag)
                .collect(Collectors.toList());

        return LiveFeedback.builder()
                .id(feedback.getId())
                .customerName(customerName)
                .sentiment(feedback.getSentimentLabel() != null ? feedback.getSentimentLabel().name() : "NEUTRAL")
                .rating(feedback.getRating())
                .sentimentScore(feedback.getSentimentScore())
                .comment(feedback.getComment())
                .tags(displayTags)
                .build();
    }

//    private String translateTag(FeedbackTag tag)
//    {
//        if (tag == null || tag.getAspect() == null) return "Khác";
//
//        return switch (tag.getAspect().toUpperCase()) {
//            case "FOOD" -> "Đồ ăn & Thức uống";
//            case "DEVICE" -> "Âm thanh & Thiết bị";
//            case "SERVICE" -> "Phục vụ";
//            case "GENERAL" -> "Trải nghiệm chung";
//            default -> "Khác";
//        };
//    }

    @Override
    public Optional<WeeklyInsightDTO> getWeeklyReport(Integer week, Integer year)
    {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");

        return weeklyInsightReportRepository.findByWeekNumberAndReportYear(week, year)
                .map(report -> WeeklyInsightDTO.builder()
                        .weekNumber(report.getWeekNumber())
                        .reportYear(report.getReportYear())
                        .dateRange(report.getStartDate().format(formatter) + " - " + report.getEndDate().format(formatter))
                        .totalFeedbacks(report.getTotalFeedbacks())
                        .averageRating(report.getAverageRating())
                        .averageSentimentScore(report.getAverageSentimentScore())
                        .positiveCount(report.getPositiveCount())
                        .negativeCount(report.getNegativeCount())
                        .topIssuesSummary(report.getTopIssuesSummary())
                        .weeklyActionPlan(report.getWeeklyActionPlan() != null
                                ? List.of(report.getWeeklyActionPlan().split("\\n"))
                                : List.of())
                        .build());
    }

    @Override
    public void generateReport(String type, LocalDate date)
    {
        if ("DAY".equalsIgnoreCase(type))
        {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(23, 59, 59);
            List<Feedback> feedbacks = feedbackRepository.findByCreatedAtBetween(start, end);
            List<String> comments = feedbacks.stream()
                    .map(Feedback::getComment)
                    .filter(c -> c != null && !c.isBlank())
                    .collect(Collectors.toList());
            if (comments.isEmpty()) {
                throw new IllegalArgumentException("Không có phản hồi nào trong ngày này để tổng hợp.");
            }
            aiIntegrationService.generateDailyReport(date, comments);
        }
        else if ("WEEK".equalsIgnoreCase(type))
        {
            aiIntegrationService.generateWeeklyReport(date);
        }
        else
        {
            throw new IllegalArgumentException("Loại báo cáo không hợp lệ.");
        }
    }
}

