package com.karaoke.backend.service.ai.impl;

import com.karaoke.backend.entity.FeedbackTag;
import com.karaoke.backend.repository.FeedbackRepository;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.service.ai.RoomAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomAnalyticsServiceImpl implements RoomAnalyticsService
{
    private final FeedbackRepository feedbackRepository;
    private final InvoiceRepository invoiceRepository;

    private LocalDateTime getStartOfDay(String dateStr)
    {
        return LocalDate.parse(dateStr).atStartOfDay();
    }

    private LocalDateTime getEndOfDay(String dateStr)
    {
        return LocalDate.parse(dateStr).atTime(23, 59, 59);
    }

    @Override
    public String getWorstRoomsInPeriod(String startDateStr, String endDateStr)
    {
        LocalDateTime start = getStartOfDay(startDateStr);
        LocalDateTime end = getEndOfDay(endDateStr);

        List<Object[]> results = feedbackRepository.findRoomAverageRatingAsc(start, end, FeedbackTag.SystemTag.FACILITIES,PageRequest.of(0, 5));

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> String.format("- Phòng %s: Điểm trung bình %.1f sao (Dựa trên %d lượt đánh giá)",
                        row[0], (Double) row[1], (Long) row[2]))
                .collect(Collectors.joining("\n"));
    }

    @Override
    public String getBestRoomsInPeriod(String startDateStr, String endDateStr)
    {
        LocalDateTime start = getStartOfDay(startDateStr);
        LocalDateTime end = getEndOfDay(endDateStr);

        List<Object[]> results = feedbackRepository.findRoomAverageRatingDesc(start, end, FeedbackTag.SystemTag.FACILITIES,PageRequest.of(0, 5));

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> String.format("- Phòng %s: Điểm trung bình %.1f sao (Dựa trên %d lượt đánh giá)",
                        row[0], (Double) row[1], (Long) row[2]))
                .collect(Collectors.joining("\n"));
    }

    @Override
    public String getRoomUtilization(String startDateStr, String endDateStr)
    {
        LocalDateTime start = getStartOfDay(startDateStr);
        LocalDateTime end = getEndOfDay(endDateStr);

        List<Object[]> results = invoiceRepository.findRoomUtilization(start, end);

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> String.format("- Phòng %s: %d lượt khách", row[0], (Long) row[1]))
                .collect(Collectors.joining("\n"));
    }

    @Override
    public String getRoomRevenueRanking(String startDateStr, String endDateStr)
    {
        LocalDateTime start = getStartOfDay(startDateStr);
        LocalDateTime end = getEndOfDay(endDateStr);

        List<Object[]> results = invoiceRepository.findRoomRevenueRanking(start, end);

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> String.format("- Phòng %s: Mang về %s VNĐ", row[0], row[1].toString()))
                .collect(Collectors.joining("\n"));
    }
}
