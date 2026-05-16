package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActionableInsight
{
    private Integer id;
    private String title;
    private String content;
    private String solution;
    private String severityLevel;
}
