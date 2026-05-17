package com.karaoke.backend.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatClientConfig
{
    @Bean
    public ChatClient dashboardAgentClient(ChatClient.Builder builder, ToolCallbackProvider toolCallbackProvider)
    {
        return builder
                .defaultToolCallbacks(toolCallbackProvider.getToolCallbacks())
                .defaultSystem("""
                    Bạn là trợ lý AI thông minh quản lý hệ thống quán Karaoke.
                    Bạn có quyền truy cập vào các công cụ (Tools) để tra cứu phòng, doanh thu, nhân viên, khách hàng và đánh giá.
                    Hãy suy nghĩ thật nhanh, chọn công cụ chính xác và trả lời ngắn gọn, tập trung vào số liệu thực tế.
                    Không chào hỏi rườm rà, đi thẳng vào kết quả phân tích.
                    """)
                .build();
    }
}