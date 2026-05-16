package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.DiscountPercentRequest;
import com.karaoke.backend.dto.request.DiscountRequest;
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
import java.util.Map;

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

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'MANAGER')")
    public ResponseEntity<?> confirmPayment(@PathVariable Integer id)
    {
        try {
            invoiceService.markAsPaid(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Xác nhận thanh toán thành công cho hóa đơn #" + id,
                    "status", "PAID"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/discount-percent")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'MANAGER')")
    public ResponseEntity<?> applyDiscountPercent(
            @PathVariable Integer id,
            @RequestBody DiscountPercentRequest request)
    {
        try {
            invoiceService.applyPercentageDiscount(id, request.getDiscountPercent());
            return ResponseEntity.ok("Đã áp dụng giảm " + request.getDiscountPercent() + "% thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/discount")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN', 'MANAGER')")
    public ResponseEntity<?> applyDiscount(
            @PathVariable Integer id,
            @RequestBody DiscountRequest request)
    {
        try {
            invoiceService.applyDirectDiscount(id, request.getDiscountAmount());
            return ResponseEntity.ok("Đã áp dụng giảm giá thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
