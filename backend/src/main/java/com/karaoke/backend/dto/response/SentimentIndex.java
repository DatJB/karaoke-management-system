package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SentimentIndex
{
    private Double positivePercent;
    private Double neutralPercent;
    private Double negativePercent;
}
