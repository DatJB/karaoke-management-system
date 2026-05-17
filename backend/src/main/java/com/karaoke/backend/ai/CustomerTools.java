package com.karaoke.backend.ai;

import com.karaoke.backend.service.ai.CustomerAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomerTools
{
    private final CustomerAnalyticsService customerAnalyticsService;

    @Tool(description = "Thống kê Top khách hàng chi tiêu nhiều nhất (mang lại doanh thu cao nhất) trong một khoảng thời gian. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getTopSpendersInPeriod(String startDateStr, String endDateStr)
    {
        try {
            LocalDateTime start = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            String result = customerAnalyticsService.getTopSpenders(start, end);
            if (result == null || result.isEmpty()) return "Không có dữ liệu chi tiêu trong giai đoạn này.";

            return "Top khách hàng chi tiêu nhiều nhất từ " + startDateStr + " đến " + endDateStr + ":\n" + result;
        } catch (Exception e) {
            return "Lỗi thống kê chi tiêu: " + e.getMessage();
        }
    }

    @Tool(description = "Thống kê Top khách hàng đến quán nhiều lần nhất (tần suất cao nhất, khách ruột) trong một khoảng thời gian. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getMostFrequentCustomersInPeriod(String startDateStr, String endDateStr)
    {
        try {
            LocalDateTime start = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            String result = customerAnalyticsService.getMostFrequentCustomers(start, end);
            if (result == null || result.isEmpty()) return "Không có khách hàng nào đến quán trong thời gian này.";

            return "Top khách hàng đến quán thường xuyên nhất từ " + startDateStr + " đến " + endDateStr + ":\n" + result;
        } catch (Exception e) {
            return "Lỗi thống kê tần suất khách: " + e.getMessage();
        }
    }

    @Tool(description = "Tìm danh sách các khách hàng 'Ngủ đông' (từng đến quán nhưng đã không quay lại trong một số tháng nhất định). Tham số inactiveMonths là số tháng không có giao dịch (ví dụ: 3).")
    public String getSleepingCustomers(int inactiveMonths)
    {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusMonths(inactiveMonths);

            String result = customerAnalyticsService.getSleepingCustomers(cutoffDate);
            if (result == null || result.isEmpty()) {
                return "Tuyệt vời! Không có khách hàng nào bỏ đi trong " + inactiveMonths + " tháng qua.";
            }
            return "Danh sách khách hàng không quay lại trong " + inactiveMonths + " tháng qua:\n" + result;
        } catch (Exception e) {
            return "Lỗi tra cứu khách hàng ngủ đông: " + e.getMessage();
        }
    }
}