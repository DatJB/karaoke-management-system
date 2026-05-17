package com.karaoke.backend.ai;

import com.karaoke.backend.service.ai.EmployeeAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
public class EmployeeTools
{
    private final EmployeeAnalyticsService employeeAnalyticsService;

    @Tool(description = "Thống kê tổng quỹ lương (chi phí nhân sự) mà quán phải chi trả trong một khoảng thời gian cụ thể. Dùng để báo cáo chi phí vận hành và tính toán lợi nhuận ròng. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getPayrollSummaryInPeriod(String startDateStr, String endDateStr)
    {
        try {
            LocalDateTime start = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            String result = employeeAnalyticsService.getTotalPayroll(start, end);
            if (result == null || result.isEmpty())
            {
                return "Không tìm thấy dữ liệu bảng lương trong khoảng thời gian từ " + startDateStr + " đến " + endDateStr;
            }
            return "Báo cáo quỹ lương nhân viên (" + startDateStr + " đến " + endDateStr + "):\n" + result;
        } catch (DateTimeParseException e) {
            return "Lỗi: Định dạng ngày tháng không đúng. Vui lòng sử dụng yyyy-MM-dd.";
        } catch (Exception e) {
            return "Lỗi khi thống kê quỹ lương: " + e.getMessage();
        }
    }

    @Tool(description = "Thống kê danh sách nhân viên làm việc năng suất nhất dựa trên số lượt phục vụ, số order hoặc khối lượng công việc đã hoàn thành. Dùng để xét thưởng KPI. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getTopPerformingEmployeesInPeriod(String startDateStr, String endDateStr, int limit)
    {
        try {
            LocalDateTime start = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            String result = employeeAnalyticsService.getTopPerformingEmployees(start, end, limit);
            if (result == null || result.isEmpty())
            {
                return "Chưa có dữ liệu thống kê năng suất nhân viên trong giai đoạn này.";
            }
            return "Danh sách nhân viên xuất sắc (" + startDateStr + " đến " + endDateStr + "):\n" + result;
        } catch (Exception e) {
            return "Lỗi khi thống kê năng suất nhân viên: " + e.getMessage();
        }
    }

    @Tool(description = "Kiểm tra các phản hồi tiêu cực hoặc phàn nàn của khách hàng liên quan trực tiếp đến thái độ phục vụ của nhân viên. Dùng để đánh giá chất lượng nhân sự. Tham số startDateStr và endDateStr chuẩn yyyy-MM-dd.")
    public String getEmployeeFeedbackIssuesInPeriod(String startDateStr, String endDateStr)
    {
        try {
            LocalDateTime start = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            String result = employeeAnalyticsService.getEmployeeFeedbackIssues(start, end);
            if (result == null || result.isEmpty())
            {
                return "Tuyệt vời! Không có nhân viên nào bị phàn nàn trong khoảng thời gian này.";
            }
            return "Danh sách các vấn đề về thái độ phục vụ nhân viên:\n" + result;
        } catch (Exception e) {
            return "Lỗi khi tra cứu đánh giá nhân viên: " + e.getMessage();
        }
    }

    @Tool(description = "Thống kê các vi phạm về chấm công như đi muộn, về sớm hoặc nghỉ không phép của nhân viên. Dùng để giải trình các khoản trừ trong bảng lương. Tham số startDateStr và endDateStr chuẩn yyyy-MM-dd.")
    public String getAttendanceIssuesInPeriod(String startDateStr, String endDateStr)
    {
        try {
            LocalDateTime start = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            String result = employeeAnalyticsService.getAttendanceIssues(start, end);
            if (result == null || result.isEmpty())
            {
                return "Không có ghi nhận vi phạm chấm công nào trong giai đoạn từ " + startDateStr + " đến " + endDateStr;
            }
            return "Báo cáo vi phạm chấm công và kỷ luật:\n" + result;
        } catch (Exception e) {
            return "Lỗi khi tra cứu dữ liệu chấm công: " + e.getMessage();
        }
    }

    @Tool(description = "Thống kê các biên bản kỷ luật, lỗi vi phạm nghiệp vụ (như lỗi Booking, thái độ sai phạm - MISCONDUCT) hoặc các hình phạt khác của nhân viên. Dùng để xem ai đang phá hoại vận hành quán. Tham số startDateStr và endDateStr BẮT BUỘC định dạng yyyy-MM-dd.")
    public String getEmployeePenaltiesInPeriod(String startDateStr, String endDateStr)
    {
        try {
            LocalDateTime start = LocalDate.parse(startDateStr).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDateStr).atTime(23, 59, 59);

            String result = employeeAnalyticsService.getEmployeePenalties(start, end);
            if (result == null || result.isEmpty())
            {
                return "Tuyệt vời! Không có nhân viên nào vi phạm kỷ luật hay lỗi nghiệp vụ trong giai đoạn này.";
            }
            return "Báo cáo vi phạm kỷ luật và lỗi nghiệp vụ:\n" + result;
        } catch (Exception e) {
            return "Lỗi khi tra cứu dữ liệu kỷ luật: " + e.getMessage();
        }
    }
}