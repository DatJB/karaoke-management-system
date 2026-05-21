package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceTamperReportDto {
    private Integer invoiceId;
    private String status; // "OK", "TAMPERED"
    private String storedHash;
    private String calculatedHash;
    private String message;
}
