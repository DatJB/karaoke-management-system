package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.DiscountPercentRequest;
import com.karaoke.backend.dto.response.InvoiceDetailResponse;
import com.karaoke.backend.dto.response.InvoiceSummaryResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface InvoiceService
{
    Page<InvoiceSummaryResponse> getInvoices(String statusStr, String keyword, LocalDate date, int page, int size);

    InvoiceDetailResponse getInvoiceDetail(Integer id);

    void markAsPaid(Integer invoiceId);

    void applyPercentageDiscount(Integer invoiceId, BigDecimal discountPercent);

    void applyDirectDiscount(Integer invoiceId, BigDecimal discountAmount);
}
