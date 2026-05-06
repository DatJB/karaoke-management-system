package com.karaoke.backend.service.impl;

import com.karaoke.backend.entity.AiInsightReport;
import com.karaoke.backend.entity.Feedback;
import com.karaoke.backend.entity.FeedbackTag;
import com.karaoke.backend.repository.AiInsightReportRepository;
import com.karaoke.backend.repository.FeedbackRepository;
import com.karaoke.backend.service.AiIntegrationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiIntegrationServiceImpl implements AiIntegrationService
{
    private final FeedbackRepository feedbackRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AiInsightReportRepository aiInsightReportRepository;

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
            String prompt = "Phân tích bình luận quán Karaoke sau. " +
                    "Trả về JSON chính xác với 3 trường: " +
                    "'sentiment' (chỉ chọn POSITIVE, NEGATIVE, NEUTRAL), " +
                    "'score' (số thập phân 0.0 đến 5.0, 1.0 là rất tiêu cực, 5.0 là rất tích cực), " +
                    "'tags' (mảng chuỗi, chứa 1 đến 4 cụm từ cực kỳ ngắn gọn (2-5 chữ) tóm tắt chính xác các vấn đề/lời khen trong câu. VD: 'món ăn ngon', 'phục vụ lâu', 'kẹt máy in', 'phòng hôi'). " +
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

            List<String> extractedTags = new ArrayList<>();
            JsonNode tagsNode = resultNode.path("tags");
            if (tagsNode.isArray())
            {
                for (JsonNode node : tagsNode)
                {
                    String rawTag = node.asText().trim();
                    if (!rawTag.isEmpty()) {
                        String formattedTag = rawTag.substring(0, 1).toUpperCase() + rawTag.substring(1).toLowerCase();
                        extractedTags.add(formattedTag);
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
        }
    }
}
