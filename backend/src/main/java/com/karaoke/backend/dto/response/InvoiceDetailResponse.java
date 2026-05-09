package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailResponse {
    private Integer invoiceId;
    private Integer bookingId;
    private String customerName;
    private String customerPhone;
    private String customerIdentity;
    private String status;
    private LocalDateTime createdAt;

    private List<InvoiceRoomDetailDto> roomDetails;
    private List<InvoiceItemDetail> itemDetails;

    private BigDecimal totalRoomPrice;
    private BigDecimal totalServicePrice;
    private BigDecimal discountPercent;
    private BigDecimal discount;
    private BigDecimal totalPrice;
}
