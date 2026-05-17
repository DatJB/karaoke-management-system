package com.karaoke.backend.service.ai.impl;

import com.karaoke.backend.service.ai.AgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AgentServiceImpl implements AgentService
{
    private final ChatClient dashboardAgentClient;
    private final ToolCallbackProvider toolCallbackProvider;

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 60000))
    public String ask(String question)
    {
        LocalDate today = LocalDate.now();
        int currentDay = today.getDayOfMonth();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        String systemPrompt = """
                Bạn là trợ lý AI quản lý hệ thống quán Karaoke.
                
                [THÔNG TIN THỜI GIAN THỰC TẾ]
                Hôm nay là: Ngày %d, Tháng %d, Năm %d.
                
                [LUẬT GỌI CÔNG CỤ (TOOL CALLING) - BẮT BUỘC TUÂN THỦ]
                Khi gọi các Tool yêu cầu tham số thời gian (ngày, tháng, năm), BẠN PHẢI TRUYỀN SỐ NGUYÊN (Integer), TUYỆT ĐỐI KHÔNG dùng chữ (như 'current', 'now', 'today').
                - Nếu người dùng hỏi 'hôm nay', 'ngày này' -> Tham số ngày = %d.
                - Nếu người dùng hỏi 'tháng này', 'tháng hiện tại' -> Tham số tháng = %d.
                - Nếu người dùng hỏi 'năm nay', 'năm hiện tại' -> Tham số năm = %d.
                
                Hãy suy nghĩ logic, chọn đúng công cụ và trả lời ngắn gọn số liệu thực tế.
                """.formatted(
                currentDay, currentMonth, currentYear,
                currentDay, currentMonth, currentYear
        );

        return dashboardAgentClient.prompt()
                .system(systemPrompt)
                .user(question)
                .call()
                .content();
    }

    @Recover
    public String recover(Exception e, String question)
    {
        return "AI hiện đang quá tải, vui lòng thử lại sau.";
    }
}
