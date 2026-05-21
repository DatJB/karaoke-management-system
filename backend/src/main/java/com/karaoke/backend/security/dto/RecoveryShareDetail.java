package com.karaoke.backend.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecoveryShareDetail {
    private int x;
    private String y;
    private String uploadedBy;
    private String fileName;
    private long uploadedAt;
}
