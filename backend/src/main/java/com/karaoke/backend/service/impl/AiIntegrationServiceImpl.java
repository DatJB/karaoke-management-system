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
                    "Trả về JSON chính xác với 2 trường: " +
                    "'sentiment' (chỉ chọn POSITIVE, NEGATIVE, NEUTRAL) và " +
                    "'tags' (mảng chuỗi, chỉ chọn từ: FOOD, DEVICE, SERVICE, GENERAL). " +
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

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String aiRawJson = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            JsonNode resultNode = objectMapper.readTree(aiRawJson);
            String sentimentStr = resultNode.path("sentiment").asText("NEUTRAL");

            List<FeedbackTag> extractedTags = new ArrayList<>();
            JsonNode tagsNode = resultNode.path("tags");
            if (tagsNode.isArray())
            {
                for (JsonNode node : tagsNode) {
                    try {
                        extractedTags.add(FeedbackTag.valueOf(node.asText().toUpperCase()));
                    } catch (IllegalArgumentException ignored) {
                    }
                }
            }

            feedbackRepository.findById(feedbackId).ifPresent(feedback -> {
                feedback.setSentimentLabel(Feedback.SentimentLabel.valueOf(sentimentStr));
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
    public void  generateDailyReport(LocalDate date, List<String> comments) {
        try {
            String allComments = String.join(" | ", comments);

            String prompt = "Dựa trên các bình luận sau của khách quán Karaoke ngày " + date + ": \"" + allComments + "\". " +
                    "Hãy tổng hợp thành các báo cáo insight. Trả về một đối tượng JSON có chứa một mảng tên là 'reports', mỗi phần tử trong mảng có: " +
                    "'category' (chỉ chọn 1 trong: FOOD, DEVICE, SERVICE, GENERAL), " +
                    "'title' (tiêu đề ngắn gọn), " +
                    "'content' (phân tích chi tiết), " +
                    "'severity' (chỉ chọn 1 trong: LOW, MEDIUM, HIGH, CRITICAL).";

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
