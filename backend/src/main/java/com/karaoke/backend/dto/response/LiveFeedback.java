package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LiveFeedback
{
    private Integer id;
    private String customerName;
    private String sentiment;
    private String comment;
    private List<String> tags;
}
