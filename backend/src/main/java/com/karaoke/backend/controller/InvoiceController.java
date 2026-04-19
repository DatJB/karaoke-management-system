package com.karaoke.backend.controller;

import com.karaoke.backend.dto.response.InvoiceDetailResponse;
import com.karaoke.backend.dto.response.InvoiceSummaryResponse;
import com.karaoke.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController
{
    private final InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Page<InvoiceSummaryResponse>> getInvoices(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size)
    {
        Page<InvoiceSummaryResponse> invoices = invoiceService.getInvoices(
                status, keyword, date, page, size);

        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<InvoiceDetailResponse> getInvoiceDetail(@PathVariable Integer id) {

        InvoiceDetailResponse invoiceDetail = invoiceService.getInvoiceDetail(id);
        return ResponseEntity.ok(invoiceDetail);
    }
}
