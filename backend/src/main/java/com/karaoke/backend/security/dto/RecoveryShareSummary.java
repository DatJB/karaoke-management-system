package com.karaoke.backend.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecoveryShareSummary {
    private int x;
    private String uploadedBy;
    private String fileName;
    private long uploadedAt;
}
