package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.DiscountPercentRequest;
import com.karaoke.backend.dto.request.DiscountRequest;
import com.karaoke.backend.dto.response.InvoiceDetailResponse;
import com.karaoke.backend.dto.response.InvoiceSummaryResponse;
import com.karaoke.backend.service.InvoiceService;
import com.karaoke.backend.security.service.InvoiceSecurityService;
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
    private final InvoiceSecurityService invoiceSecurityService;

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

    @PostMapping("/security/generate-keys")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateKeys() {
        try {
            String privateKeyPem = invoiceSecurityService.generateKeyPair();
            byte[] data = privateKeyPem.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=private_key.pem");
            headers.add(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/x-pem-file");

            return new ResponseEntity<>(data, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/security/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> verifyChain(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        try {
            return ResponseEntity.ok(invoiceSecurityService.verifyInvoiceChain(org.springframework.data.domain.PageRequest.of(page, size)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/security/recover")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> recoverAmounts(
            @RequestParam("privateKeyFile") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File Private Key trống!"));
            }
            String privateKeyPem = new String(file.getBytes(), java.nio.charset.StandardCharsets.UTF_8);
            return ResponseEntity.ok(invoiceSecurityService.verifyAndRecoverAmounts(privateKeyPem, org.springframework.data.domain.PageRequest.of(page, size)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/security/migrate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> migrateInvoices() {
        try {
            invoiceSecurityService.migrateLegacyInvoices();
            return ResponseEntity.ok(Map.of("message", "Đã di trú và bảo mật thành công toàn bộ hóa đơn cũ!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
