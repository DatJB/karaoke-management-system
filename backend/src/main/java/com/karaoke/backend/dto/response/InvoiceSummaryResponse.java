package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceSummaryResponse {
    private Integer invoiceId;
    private Integer bookingId;
    private String customerName;
    private String customerPhone;
    private String customerIdentity;
    private String roomNames;
    private String status;
    private LocalDateTime createdAt;
}
