package com.karaoke.backend.ai;

import com.karaoke.backend.entity.Feedback;
import com.karaoke.backend.entity.FeedbackTag;
import com.karaoke.backend.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackTools
{
    private final FeedbackRepository feedbackRepository;

    @Tool(description = "Lấy các feedback tiêu cực gần đây của khách hàng")
    public String getRecentNegativeFeedback()
    {
        List<Feedback> feedbacks =
                feedbackRepository.findTop5BySentimentLabelOrderByCreatedAtDesc(
                                Feedback.SentimentLabel.NEGATIVE);

        if (feedbacks.isEmpty())
        {
            return "Không có feedback tiêu cực.";
        }

        return feedbacks.stream()
                .map(f -> "- " + f.getComment())
                .collect(Collectors.joining("\n"));
    }

    @Tool(description = "Lấy các feedback tích cực gần đây")
    public String getRecentPositiveFeedback()
    {
        List<Feedback> feedbacks = feedbackRepository.findTop5BySentimentLabelOrderByCreatedAtDesc(
                                Feedback.SentimentLabel.POSITIVE);

        if (feedbacks.isEmpty())
        {
            return "Không có feedback tích cực.";
        }

        return feedbacks.stream()
                .map(f -> "- " + f.getComment())
                .collect(Collectors.joining("\n"));
    }

    @Tool(description = "Đếm số feedback tiêu cực")
    public int countNegativeFeedback()
    {
        return feedbackRepository.countBySentimentLabel(
                Feedback.SentimentLabel.NEGATIVE
        );
    }

    @Tool(description = "Đếm số feedback tích cực")
    public int countPositiveFeedback()
    {
        return feedbackRepository.countBySentimentLabel(
                Feedback.SentimentLabel.POSITIVE
        );
    }


    @Tool(description = "Đếm số lượng feedback trong một khoảng thời gian, có thể lọc theo cảm xúc. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd. Tham số sentimentLabel có thể truyền POSITIVE, NEGATIVE, NEUTRAL, hoặc truyền ALL nếu muốn đếm tất cả.")
    public String countFeedbackInPeriod(String startDateStr, String endDateStr, String sentimentLabel)
    {
        try {
            LocalDateTime startDateTime = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime endDateTime = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            long count;
            String sentimentText = "";

            if (sentimentLabel != null && !sentimentLabel.trim().isEmpty() && !sentimentLabel.equalsIgnoreCase("ALL"))
            {
                Feedback.SentimentLabel enumLabel = Feedback.SentimentLabel.valueOf(sentimentLabel.toUpperCase());
                count = feedbackRepository.countBySentimentLabelAndCreatedAtBetween(enumLabel, startDateTime, endDateTime);

                sentimentText = switch (enumLabel) {
                    case POSITIVE -> " TÍCH CỰC (Khen ngợi)";
                    case NEGATIVE -> " TIÊU CỰC (Phàn nàn)";
                    case NEUTRAL -> " TRUNG LẬP";
                };
            }
            else
            {
                count = feedbackRepository.countByCreatedAtBetween(startDateTime, endDateTime);
            }

            return "Từ ngày " + startDateStr + " đến " + endDateStr + ", hệ thống ghi nhận tổng cộng " + count + " đánh giá" + sentimentText + ".";

        } catch (IllegalArgumentException e) {
            return "Lỗi: Tham số sentimentLabel không hợp lệ. Hãy tự sửa lại thành POSITIVE, NEGATIVE, NEUTRAL hoặc ALL.";
        } catch (DateTimeParseException e) {
            return "Lỗi định dạng ngày tháng. Hãy tự sửa lại theo chuẩn yyyy-MM-dd.";
        } catch (Exception e) {
            return "Có lỗi khi truy vấn dữ liệu: " + e.getMessage();
        }
    }

    @Tool(description = "Lấy danh sách chi tiết nội dung các feedback trong một khoảng thời gian. Có thể lọc theo cảm xúc (POSITIVE, NEGATIVE, NEUTRAL, ALL). Định dạng ngày yyyy-MM-dd.")
    public String getFeedbackDetailsInPeriod(String startDateStr, String endDateStr, String sentimentLabel)
    {
        try {
            LocalDateTime startDateTime = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime endDateTime = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            List<Feedback> feedbacks;
            if (sentimentLabel != null && !sentimentLabel.equalsIgnoreCase("ALL")) {
                Feedback.SentimentLabel enumLabel = Feedback.SentimentLabel.valueOf(sentimentLabel.toUpperCase());
                feedbacks = feedbackRepository.findTop10ByCreatedAtBetweenAndSentimentLabelOrderByCreatedAtDesc(
                        startDateTime, endDateTime, enumLabel);
            } else {
                feedbacks = feedbackRepository.findTop10ByCreatedAtBetweenOrderByCreatedAtDesc(startDateTime, endDateTime);
            }

            if (feedbacks.isEmpty()) return "Không tìm thấy đánh giá nào trong khoảng thời gian này.";

            return feedbacks.stream()
                    .map(f -> String.format("[%s] Sao: %.1f | Nội dung: %s",
                            f.getCreatedAt().toLocalDate(), f.getRating(), f.getComment()))
                    .collect(Collectors.joining("\n"));

        } catch (Exception e) {
            return "Lỗi khi lấy chi tiết feedback: " + e.getMessage();
        }
    }

    @Tool(description = "Thống kê Top các vấn đề/từ khóa (Tags) được khách hàng nhắc đến nhiều nhất trong một khoảng thời gian. Rất hữu ích để xem xu hướng phàn nàn hoặc khen ngợi. Tham số startDateStr và endDateStr chuẩn yyyy-MM-dd. sentimentLabel có thể là POSITIVE, NEGATIVE, NEUTRAL hoặc ALL.")
    public String getTopFeedbackTagsInPeriod(String startDateStr, String endDateStr, String sentimentLabel)
    {
        try {
            LocalDateTime startDateTime = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime endDateTime = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            List<Feedback> feedbacks;

            if (sentimentLabel != null && !sentimentLabel.equalsIgnoreCase("ALL")) {
                Feedback.SentimentLabel enumLabel = Feedback.SentimentLabel.valueOf(sentimentLabel.toUpperCase());
                feedbacks = feedbackRepository.findAllByCreatedAtBetweenAndSentimentLabel(startDateTime, endDateTime, enumLabel);
            } else {
                feedbacks = feedbackRepository.findAllByCreatedAtBetween(startDateTime, endDateTime);
            }

            if (feedbacks.isEmpty())
            {
                return "Không có dữ liệu đánh giá nào để phân tích từ khóa trong giai đoạn này.";
            }

            Map<String, Long> tagFrequency = feedbacks.stream()
                    .filter(f -> f.getExtractedTags() != null && !f.getExtractedTags().isEmpty())
                    .flatMap(f -> f.getExtractedTags().stream())
                    .map(FeedbackTag::getExtractedTag)
                    .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

            if (tagFrequency.isEmpty())
            {
                return "Khách có đánh giá nhưng không trích xuất được từ khóa (tag) nào.";
            }

            String topTags = tagFrequency.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(5)
                    .map(entry -> "- Từ khóa '" + entry.getKey() + "': xuất hiện " + entry.getValue() + " lần")
                    .collect(Collectors.joining("\n"));

            return "Top 5 vấn đề được nhắc đến nhiều nhất:\n" + topTags;

        } catch (Exception e) {
            return "Lỗi khi thống kê từ khóa: " + e.getMessage();
        }
    }
}