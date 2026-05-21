package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRecoveryReportDto {
    private Integer invoiceId;
    private String status; // "MATCH", "MISMATCH", "NOT_ENCRYPTED", "DECRYPTION_FAILED"
    private BigDecimal dbAmount;
    private BigDecimal decryptedAmount;
    private String message;
}
