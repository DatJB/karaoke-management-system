package com.karaoke.backend.service.impl;

import com.karaoke.backend.entity.AiInsightReport;
import com.karaoke.backend.entity.Feedback;
import com.karaoke.backend.entity.FeedbackTag;
import com.karaoke.backend.entity.WeeklyInsightReport;
import com.karaoke.backend.repository.AiInsightReportRepository;
import com.karaoke.backend.repository.FeedbackRepository;
import com.karaoke.backend.repository.WeeklyInsightReportRepository;
import com.karaoke.backend.service.AiIntegrationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiIntegrationServiceImpl implements AiIntegrationService
{
    private final FeedbackRepository feedbackRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AiInsightReportRepository aiInsightReportRepository;
    private final WeeklyInsightReportRepository weeklyInsightReportRepository;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Async
    @Override
    @Transactional
    public void analyzeFeedbackAsync(Integer feedbackId, String comment)
    {
        try {
//            String prompt = "Phân tích bình luận quán Karaoke sau. " +
//                    "Trả về JSON chính xác với 3 trường: " +
//                    "'sentiment' (chỉ chọn POSITIVE, NEGATIVE, NEUTRAL), " +
//                    "'score' (số thập phân 0.0 đến 5.0, 1.0 là rất tiêu cực, 5.0 là rất tích cực), " +
//                    "'tags' (mảng chuỗi, chứa 1 đến 4 cụm từ cực kỳ ngắn gọn (2-5 chữ) tóm tắt chính xác các vấn đề/lời khen trong câu. VD: 'món ăn ngon', 'phục vụ lâu', 'kẹt máy in', 'phòng hôi'). " +
//                    "Bình luận: \"" + comment + "\"";

            String prompt = "Phân tích bình luận quán Karaoke sau. " +
                    "Trả về JSON chính xác với 3 trường: " +
                    "'sentiment' (chỉ chọn POSITIVE, NEGATIVE, NEUTRAL), " +
                    "'score' (số thập phân 0.0 đến 5.0, 1.0 là rất tiêu cực, 5.0 là rất tích cực), " +
                    "'tags' (là một mảng các object, mỗi object có 2 trường: 'tagName' và 'extractedTag'). \n" +
                    "LUẬT CỦA MẢNG TAGS:\n" +
                    "- 'tagName' CHỈ ĐƯỢC CHỌN 1 trong các giá trị sau: SERVICE (phục vụ, thái độ), FOOD (đồ ăn, thức uống), FACILITIES (vệ sinh, không gian), EQUIPMENT (âm thanh, mic, loa, máy lạnh), PRICE (giá cả), hoặc GENERAL (nhận xét chung). (trả về các từ viết hoa như trên nhé(SERVICE, FOOD, FACILITIES, EQUIPMENT, PRICE, GENERAL))\n" +
                    "- 'extractedTag' là cụm từ cực kỳ ngắn gọn (2-5 chữ) trích xuất từ câu để mô tả chi tiết. VD: 'phục vụ chậm', 'mic rè', 'phòng hôi'.\n" +
                    "Bình luận: \"" + comment + "\"";

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "response_mime_type", "application/json"
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    apiUrl + apiKey,
                    entity,
                    String.class
            );

            System.out.println("ok");

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String aiRawJson = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            JsonNode resultNode = objectMapper.readTree(aiRawJson);
            String sentimentStr = resultNode.path("sentiment").asText("NEUTRAL");
            double sentimentScore = resultNode.path("score").asDouble(3.0);

            List<FeedbackTag> extractedTags = new ArrayList<>();
            JsonNode tagsNode = resultNode.path("tags");
            if (tagsNode.isArray())
            {
                for (JsonNode node : tagsNode)
                {
//                    String rawTag = node.asText().trim();
//                    if (!rawTag.isEmpty()) {
//                        String formattedTag = rawTag.substring(0, 1).toUpperCase() + rawTag.substring(1).toLowerCase();
//                        extractedTags.add(formattedTag);
//                    }
                    String tName = node.path("tagName").asText("GENERAL");
                    String rawTag = node.path("extractedTag").asText("").trim();

                    if (!rawTag.isEmpty()) {
                        String eTag = rawTag.substring(0, 1).toUpperCase() + rawTag.substring(1).toLowerCase();

                        FeedbackTag.SystemTag systemTag;
                        try {
                            if (tName.isEmpty()) {
                                systemTag = FeedbackTag.SystemTag.GENERAL;
                            } else {
                                systemTag = FeedbackTag.SystemTag.valueOf(tName);
                            }
                        } catch (IllegalArgumentException ex) {
                            log.warn("AI trả về tag không hợp lệ: {}. Đã chuyển thành GENERAL.", tName);
                            systemTag = FeedbackTag.SystemTag.GENERAL;
                        }

                        extractedTags.add(new FeedbackTag(systemTag, eTag));
                    }
                }
            }

            feedbackRepository.findById(feedbackId).ifPresent(feedback -> {
                feedback.setSentimentLabel(Feedback.SentimentLabel.valueOf(sentimentStr));
                feedback.setSentimentScore(BigDecimal.valueOf(sentimentScore));
                feedback.setExtractedTags(extractedTags);
                feedbackRepository.save(feedback);
            });

        } catch (Exception e)
        {
            log.error("AI Analysis failed for Feedback ID {}: {}", feedbackId, e.getMessage());
        }
    }

    @Override
    @Transactional
    public void generateDailyReport(LocalDate date, List<String> comments) {
        try {
            String allComments = String.join(" | ", comments);

            String prompt = "Bạn là Giám đốc vận hành chuỗi Karaoke chuyên nghiệp. " +
                    "Dựa trên danh sách bình luận thực tế của khách hàng trong ngày " + date + ": \n" +
                    "[" + allComments + "]\n\n" +
                    "Hãy phân tích và tổng hợp thành các insight báo cáo. Trả về duy nhất một đối tượng JSON có chứa mảng 'reports'. " +
                    "Mỗi phần tử trong mảng phải có đủ 5 trường sau:\n" +
                    "1. 'category' (chỉ chọn: FOOD, DEVICE, SERVICE, GENERAL)\n" +
                    "2. 'title' (Tiêu đề ngắn gọn tóm tắt nhóm vấn đề hoặc điểm sáng)\n" +
                    "3. 'content' (Phân tích chi tiết: có bao nhiêu khách gặp vấn đề này, tình trạng cụ thể là gì)\n" +
                    "4. 'solution' (Đề xuất giải pháp hành động cụ thể cho Quản lý quán để khắc phục lỗi hoặc phát huy điểm tốt)\n" +
                    "5. 'severity' (Mức độ nghiêm trọng cần xử lý: CRITICAL, HIGH, MEDIUM, LOW. Lưu ý: Các lời khen ngợi tích cực mặc định chọn LOW).";

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    ),
                    "generationConfig", Map.of(
                            "response_mime_type", "application/json"
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    apiUrl + apiKey,
                    entity,
                    String.class
            );

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String aiRawJson = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            JsonNode resultNode = objectMapper.readTree(aiRawJson);

            JsonNode reportsNode = resultNode.path("reports");

            if (reportsNode.isArray())
            {
                for (JsonNode node : reportsNode)
                {
                    AiInsightReport report = new AiInsightReport();
                    report.setReportDate(date);
                    report.setInsightTitle(node.path("title").asText());
                    report.setInsightContent(node.path("content").asText());
                    report.setSolution(node.path("solution").asText());

                    try
                    {
                        report.setCategory(AiInsightReport.Category.valueOf(node.path("category").asText().toUpperCase()));
                        report.setSeverityLevel(AiInsightReport.SeverityLevel.valueOf(node.path("severity").asText().toUpperCase()));

                        aiInsightReportRepository.save(report);
                    } catch (IllegalArgumentException e)
                    {
                        log.warn("Bỏ qua 1 insight do AI trả về sai định dạng Enum: {}", node.toString());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi tổng hợp báo cáo ngày {}: {}", date, e.getMessage());
            throw new RuntimeException("Lỗi tổng hợp báo cáo ngày: " + e.getMessage(), e);
        }
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 60000))
    @Transactional
    public void generateWeeklyReport(LocalDate dateInWeek)
    {
        WeekFields weekFields = WeekFields.ISO;
        LocalDate startDate = dateInWeek.with(DayOfWeek.MONDAY);
        LocalDate endDate = dateInWeek.with(DayOfWeek.SUNDAY);
        int weekNumber = dateInWeek.get(weekFields.weekOfWeekBasedYear());
        int reportYear = dateInWeek.get(weekFields.weekBasedYear());

        List<Feedback> weeklyFeedbacks = feedbackRepository.findByCreatedAtBetween(startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX));
        if (weeklyFeedbacks.isEmpty()) {
            throw new IllegalArgumentException("Không có phản hồi nào trong tuần này để tổng hợp.");
        }

        int total = weeklyFeedbacks.size();
        double avgRating = weeklyFeedbacks.stream().mapToDouble(f -> f.getRating() != null ? f.getRating() : 0.0).average().orElse(0.0);
        double avgSentiment = weeklyFeedbacks.stream().mapToDouble(f -> f.getSentimentScore() != null ? f.getSentimentScore().doubleValue() : 0.5).average().orElse(3);

        long positive = weeklyFeedbacks.stream().filter(f -> "POSITIVE".equals(f.getSentimentLabel().name())).count();
        long negative = weeklyFeedbacks.stream().filter(f -> "NEGATIVE".equals(f.getSentimentLabel().name())).count();

        List<AiInsightReport> dailyReports = aiInsightReportRepository.findByReportDateBetweenOrderByCreatedAtDesc(startDate, endDate);
        String dailySummaryText = dailyReports.stream()
                .map(r -> String.format("- %s: %s (Mức độ: %s)", r.getCategory(), r.getInsightTitle(), r.getSeverityLevel()))
                .collect(Collectors.joining("\n"));

        String prompt = "Bạn là chuyên gia phân tích dữ liệu kinh doanh Karaoke. " +
                "Dưới đây là tóm tắt các vấn đề trong tuần " + weekNumber + " từ các báo cáo ngày:\n" + dailySummaryText + "\n" +
                "Hãy phân tích tổng quan và trả về JSON với 2 trường:\n" +
                "1. 'topIssuesSummary': Tóm tắt ngắn gọn các xu hướng/vấn đề nổi cộm nhất tuần qua (dưới 100 chữ).\n" +
                "2. 'weeklyActionPlan': Đề xuất 3 hành động cụ thể cho tuần tới để cải thiện dịch vụ.";

        try {
            String aiRawJson = callGeminiApi(prompt);
            JsonNode resultNode = objectMapper.readTree(aiRawJson);

            WeeklyInsightReport report = weeklyInsightReportRepository.findByWeekNumberAndReportYear(weekNumber, reportYear)
                    .orElse(new WeeklyInsightReport());

            report.setWeekNumber(weekNumber);
            report.setReportYear(reportYear);
            report.setStartDate(startDate);
            report.setEndDate(endDate);
            report.setTotalFeedbacks(total);
            report.setAverageRating(avgRating);
            report.setAverageSentimentScore(avgSentiment);
            report.setPositiveCount((int) positive);
            report.setNegativeCount((int) negative);

            report.setTopIssuesSummary(resultNode.path("topIssuesSummary").asText());

            JsonNode actionPlanNode = resultNode.path("weeklyActionPlan");
            if (actionPlanNode.isArray())
            {
                List<String> actions = new ArrayList<>();
                for (JsonNode node : actionPlanNode)
                {
                    actions.add("- " + (node.isObject() ? node.toString() : node.asText()));
                }
                report.setWeeklyActionPlan(String.join("\n", actions));
            } else
            {
                report.setWeeklyActionPlan(actionPlanNode.asText());
            }

            weeklyInsightReportRepository.save(report);
            log.info("Đã lưu báo cáo tuần {} thành công!", weekNumber);

        } catch (HttpClientErrorException.TooManyRequests e)
        {
            log.warn("Quá tải API Gemini (Lỗi 429). Đang nhường quyền cho @Retryable chờ 60s và thử lại...");
            throw e;
        } catch (Exception e) {
            log.error("Lỗi tạo báo cáo tuần: {}", e.getMessage());
            throw new RuntimeException("Lỗi tạo báo cáo tuần: " + e.getMessage(), e);
        }
    }

    private String callGeminiApi(String prompt) throws Exception
    {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("response_mime_type", "application/json")
        );
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, new HttpHeaders());
        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl + apiKey, entity, String.class);

        JsonNode rootNode = objectMapper.readTree(response.getBody());
        return rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText()
                .replace("```json", "").replace("```", "").trim();
    }
}