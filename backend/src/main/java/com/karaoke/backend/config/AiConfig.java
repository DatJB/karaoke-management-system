package com.karaoke.backend.config;

import com.karaoke.backend.ai.*;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig
{
    @Bean
    ToolCallbackProvider toolCallbackProvider(
            FeedbackTools feedbackTools,
            RevenueTools revenueTools,
            RoomTools roomTools,
            CustomerTools customerTools,
            EmployeeTools employeeTools
    ) {

        return MethodToolCallbackProvider.builder()
                .toolObjects(
                        feedbackTools,
                        revenueTools,
                        roomTools,
                        customerTools,
                        employeeTools
                )
                .build();
    }
}