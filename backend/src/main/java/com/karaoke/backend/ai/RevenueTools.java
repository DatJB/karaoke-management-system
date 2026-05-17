package com.karaoke.backend.ai;

import com.karaoke.backend.service.ai.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RevenueTools {

    private final RevenueService revenueService;

    @Tool(description = "Lấy tổng doanh thu của một tháng cụ thể trong năm hiện tại. Tham số month là số nguyên từ 1 đến 12.")
    public String getRevenueByMonth(int month)
    {
        try {
            var revenue = revenueService.getRevenueByMonth(month);

            if (revenue == null) {
                return "Không có dữ liệu doanh thu cho tháng " + month;
            }

            // String formattedRevenue = NumberFormat.getCurrencyInstance(new Locale("vi", "VN")).format(revenue);

            return String.format("Tổng doanh thu của tháng %d là: %s VNĐ.", month, revenue.toString());

        } catch (Exception e) {
            return "Lỗi khi truy xuất doanh thu: " + e.getMessage();
        }
    }

    @Tool(description = "Thống kê khung giờ đông khách nhất (Peak Hours) của quán Karaoke trong một khoảng thời gian cụ thể. Dùng để tư vấn bố trí nhân sự. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getPeakHoursInPeriod(String startDateStr, String endDateStr)
    {
        try {
            LocalDateTime startDateTime = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime endDateTime = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            String peakHours = revenueService.getPeakHoursInPeriod(startDateTime, endDateTime);

            if (peakHours == null || peakHours.isEmpty()) {
                return "Chưa có đủ dữ liệu hóa đơn/đặt phòng từ ngày " + startDateStr + " đến " + endDateStr + " để thống kê khung giờ đông khách.";
            }

            return "Từ ngày " + startDateStr + " đến " + endDateStr + ", khung giờ đông khách nhất là: " + peakHours;

        } catch (DateTimeParseException e) {
            return "Lỗi định dạng ngày tháng. AI hãy tự sửa lại theo chuẩn yyyy-MM-dd.";
        } catch (Exception e) {
            return "Lỗi khi phân tích khung giờ: " + e.getMessage();
        }
    }

    @Tool(description = "Báo cáo chi tiết cơ cấu doanh thu theo từng hạng mục (Tiền giờ hát và Tiền dịch vụ ăn uống/F&B) trong một khoảng thời gian. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getRevenueBreakdownInPeriod(String startDateStr, String endDateStr)
    {
        try {
            LocalDateTime start = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            var breakdown = revenueService.getRevenueBreakdown(start, end);

            if (breakdown == null) return "Không có dữ liệu doanh thu trong khoảng thời gian này.";

            return String.format("Cơ cấu doanh thu từ %s đến %s:\n" +
                            "- Tiền giờ hát: %s VNĐ\n" +
                            "- Tiền dịch vụ (F&B): %s VNĐ\n" +
                            "-> Tổng cộng: %s VNĐ",
                    startDateStr, endDateStr,
                    breakdown.getRoomRevenue(),
                    breakdown.getServiceRevenue(),
                    breakdown.getTotalRevenue());
        } catch (Exception e) {
            return "Lỗi khi bóc tách doanh thu: " + e.getMessage();
        }
    }

    @Tool(description = "Lấy danh sách các mặt hàng dịch vụ (đồ ăn, thức uống) bán chạy nhất trong một khoảng thời gian. Dùng để quản lý kho và xem xu hướng tiêu dùng. Tham số startDateStr và endDateStr chuẩn yyyy-MM-dd.")
    public String getTopSellingItemsInPeriod(String startDateStr, String endDateStr)
    {
        try {
            LocalDateTime start = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            List<String> topItems = revenueService.getTopSellingItems(start, end, 5);

            if (topItems.isEmpty()) return "Không có dữ liệu bán hàng trong thời gian này.";

            String result = String.join("\n", topItems);
            return "Top các mặt hàng bán chạy nhất từ " + startDateStr + " đến " + endDateStr + ":\n" + result;
        } catch (Exception e) {
            return "Lỗi khi lấy danh sách mặt hàng bán chạy: " + e.getMessage();
        }
    }
}