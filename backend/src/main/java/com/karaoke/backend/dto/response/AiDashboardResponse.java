package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AiDashboardResponse
{
    private Double satisfactionScore;
    private SentimentIndex sentimentIndex;
    private List<ActionableInsight> actionableInsights;
    private NewPageResponse<LiveFeedback> liveFeedbacks;
}
