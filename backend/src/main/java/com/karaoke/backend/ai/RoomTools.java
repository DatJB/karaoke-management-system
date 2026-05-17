package com.karaoke.backend.ai;

import com.karaoke.backend.service.ai.RoomAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomTools
{
    private final RoomAnalyticsService roomAnalyticsService;

    @Tool(description = "Thống kê các phòng bị khách hàng đánh giá thấp nhất (nhiều phàn nàn, điểm sao thấp) trong một khoảng thời gian. Dùng để đề xuất bảo trì thiết bị, âm thanh hoặc vệ sinh. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getWorstRatedRoomsInPeriod(String startDateStr, String endDateStr)
    {
        try {
            String result = roomAnalyticsService.getWorstRoomsInPeriod(startDateStr, endDateStr);

            if (result == null || result.isEmpty())
            {
                return "Không có dữ liệu đánh giá phòng xấu nào từ " + startDateStr + " đến " + endDateStr;
            }
            return "Danh sách các phòng bị đánh giá thấp nhất từ " + startDateStr + " đến " + endDateStr + ":\n" + result;
        } catch (Exception e) {
            return "Lỗi khi lấy dữ liệu phòng: " + e.getMessage();
        }
    }

    @Tool(description = "Thống kê các phòng được khách hàng yêu thích và đánh giá cao nhất trong một khoảng thời gian. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getBestRatedRoomsInPeriod(String startDateStr, String endDateStr)
    {
        try {
            String result = roomAnalyticsService.getBestRoomsInPeriod(startDateStr, endDateStr);

            if (result == null || result.isEmpty()) {
                return "Không có dữ liệu đánh giá phòng tốt nào trong giai đoạn này.";
            }
            return "Danh sách các phòng được yêu thích nhất từ " + startDateStr + " đến " + endDateStr + ":\n" + result;
        } catch (Exception e) {
            return "Lỗi khi lấy dữ liệu phòng: " + e.getMessage();
        }
    }

    @Tool(description = "Thống kê top các phòng đắt khách nhất (được đặt/book nhiều nhất) và các phòng bị ế nhất trong một khoảng thời gian. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getRoomUtilizationInPeriod(String startDateStr, String endDateStr)
    {
        try {
            String result = roomAnalyticsService.getRoomUtilization(startDateStr, endDateStr);

            if (result == null || result.isEmpty())
            {
                return "Không có dữ liệu sử dụng phòng từ " + startDateStr + " đến " + endDateStr;
            }
            return "Thống kê tần suất sử dụng phòng:\n" + result;
        } catch (Exception e) {
            return "Lỗi khi thống kê tần suất phòng: " + e.getMessage();
        }
    }

    @Tool(description = "Thống kê và xếp hạng doanh thu mang lại của từng phòng hát trong một khoảng thời gian. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getRoomRevenueRankingInPeriod(String startDateStr, String endDateStr)
    {
        try {
            String result = roomAnalyticsService.getRoomRevenueRanking(startDateStr, endDateStr);

            if (result == null || result.isEmpty())
            {
                return "Không có dữ liệu doanh thu phòng trong khoảng thời gian này.";
            }
            return "Bảng xếp hạng doanh thu theo phòng:\n" + result;
        } catch (Exception e) {
            return "Lỗi khi xếp hạng doanh thu phòng: " + e.getMessage();
        }
    }
}