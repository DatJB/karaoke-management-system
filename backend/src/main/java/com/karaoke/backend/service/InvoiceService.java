package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.InvoiceDetailResponse;
import com.karaoke.backend.dto.response.InvoiceSummaryResponse;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface InvoiceService
{
    Page<InvoiceSummaryResponse> getInvoices(String statusStr, String keyword, LocalDate date, int page, int size);

    InvoiceDetailResponse getInvoiceDetail(Integer id);
}
