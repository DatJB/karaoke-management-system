package com.karaoke.backend.security.service.impl;

import com.karaoke.backend.dto.response.InvoiceRecoveryReportDto;
import com.karaoke.backend.dto.response.InvoiceTamperReportDto;
import com.karaoke.backend.dto.response.VerifyChainResponseDto;
import com.karaoke.backend.dto.response.VerifyRecoverResponseDto;
import com.karaoke.backend.entity.Invoice;
import com.karaoke.backend.entity.SystemConfig;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.repository.SystemConfigRepository;
import com.karaoke.backend.security.service.InvoiceSecurityService;
import com.karaoke.backend.util.CryptoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.File;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceSecurityServiceImpl implements InvoiceSecurityService {

    private final InvoiceRepository invoiceRepository;
    private final SystemConfigRepository systemConfigRepository;
    private static final String GENESIS_HASH = "secure-karaoke-genesis-hash-value-00000000000000000";

    @Override
    public String generateKeyPair() {
        try {
            KeyPair kp = CryptoUtils.generateRsaKeyPair();
            String pubPem = CryptoUtils.getPublicKeyPem(kp.getPublic());
            String privPem = CryptoUtils.getPrivateKeyPem(kp.getPrivate());

            // Save Public Key to server location
            File pubKeyFile = new File("keys/public_key.pem");
            pubKeyFile.getParentFile().mkdirs();
            Files.writeString(pubKeyFile.toPath(), pubPem, StandardCharsets.UTF_8);

            SystemConfig config = systemConfigRepository.findByConfigKey("RSA_MASTER_PUBLIC_KEY")
                    .orElse(new SystemConfig());

            config.setConfigKey("RSA_MASTER_PUBLIC_KEY");
            config.setConfigValue(pubPem);
            config.setDescription("Khóa công khai (Public Key) dùng để tự động mã hóa dữ liệu của hệ thống");

            systemConfigRepository.save(config);

            // Also keep private key backup for debugging/server reference if needed
            File privKeyFile = new File("keys/private_key_backup.pem");
            Files.writeString(privKeyFile.toPath(), privPem, StandardCharsets.UTF_8);

            return privPem;
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo cặp khóa RSA mới", e);
        }
    }

    @Override
    public VerifyChainResponseDto verifyInvoiceChain(Pageable pageable) {
        List<Invoice> paidInvoices = invoiceRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID)
                .collect(Collectors.toList());

        List<InvoiceTamperReportDto> report = new ArrayList<>();
        String previousHash = GENESIS_HASH;

        for (Invoice invoice : paidInvoices) {
            String dataStr = buildInvoiceDataString(invoice);
            String expectedHash = CryptoUtils.sha256(dataStr + previousHash);

            InvoiceTamperReportDto dto = new InvoiceTamperReportDto();
            dto.setInvoiceId(invoice.getId());
            dto.setStoredHash(invoice.getHashValue());
            dto.setCalculatedHash(expectedHash);

            if (invoice.getHashValue() == null) {
                dto.setStatus("TAMPERED");
                dto.setMessage("Hóa đơn chưa được băm bảo mật (mã băm trống).");
                previousHash = expectedHash;
            } else if (invoice.getHashValue().equals(expectedHash)) {
                dto.setStatus("OK");
                dto.setMessage("Hóa đơn hợp lệ. Không có dấu hiệu chỉnh sửa.");
                previousHash = invoice.getHashValue();
            } else {
                dto.setStatus("TAMPERED");
                dto.setMessage("CẢNH BÁO: Dữ liệu hóa đơn đã bị chỉnh sửa bất hợp pháp trực tiếp trong DB!");
                previousHash = expectedHash; // Carry expected hash to evaluate cumulative impact
            }
            report.add(dto);
        }

        boolean hasTampered = report.stream().anyMatch(item -> item.getStatus().equals("TAMPERED"));

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), report.size());
        List<InvoiceTamperReportDto> pageContent = start > report.size() ? new ArrayList<>() : report.subList(start, end);
        
        int totalPages = (int) Math.ceil((double) report.size() / pageable.getPageSize());

        return VerifyChainResponseDto.builder()
                .content(pageContent)
                .number(pageable.getPageNumber())
                .totalPages(totalPages)
                .totalElements(report.size())
                .hasTampered(hasTampered)
                .build();
    }

    @Override
    public VerifyRecoverResponseDto verifyAndRecoverAmounts(String privateKeyPem, Pageable pageable) {
        PrivateKey privateKey;
        try {
            privateKey = CryptoUtils.parsePrivateKeyPem(privateKeyPem);
        } catch (Exception e) {
            throw new IllegalArgumentException("Khóa Private Key không hợp lệ hoặc sai định dạng PEM!", e);
        }

        List<Invoice> paidInvoices = invoiceRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID)
                .collect(Collectors.toList());

        List<InvoiceRecoveryReportDto> report = new ArrayList<>();

        for (Invoice invoice : paidInvoices) {
            InvoiceRecoveryReportDto dto = new InvoiceRecoveryReportDto();
            dto.setInvoiceId(invoice.getId());
            dto.setDbAmount(invoice.getTotalPrice());

            if (invoice.getEncryptedAmount() == null || invoice.getEncryptedAmount().trim().isEmpty()) {
                dto.setStatus("NOT_ENCRYPTED");
                dto.setDecryptedAmount(null);
                dto.setMessage("Hóa đơn này được thanh toán trước khi áp dụng cơ chế mã hóa.");
                report.add(dto);
                continue;
            }

            try {
                String decryptedStr = CryptoUtils.rsaDecrypt(invoice.getEncryptedAmount(), privateKey);
                BigDecimal decryptedAmt = new BigDecimal(decryptedStr);
                dto.setDecryptedAmount(decryptedAmt);

                if (invoice.getTotalPrice().compareTo(decryptedAmt) == 0) {
                    dto.setStatus("MATCH");
                    dto.setMessage("Số tiền trùng khớp 100%. Dữ liệu an toàn.");
                } else {
                    dto.setStatus("MISMATCH");
                    dto.setMessage(String.format("CẢNH BÁO: Số tiền trong DB (%s) khác với số tiền thật giải mã (%s)!",
                            invoice.getTotalPrice().toPlainString(), decryptedAmt.toPlainString()));
                }
            } catch (Exception e) {
                dto.setStatus("DECRYPTION_FAILED");
                dto.setDecryptedAmount(null);
                dto.setMessage("Không thể giải mã số tiền. Vui lòng kiểm tra lại Private Key!");
            }
            report.add(dto);
        }

        boolean hasMismatch = report.stream().anyMatch(item -> item.getStatus().equals("MISMATCH"));
        boolean hasDecFailed = report.stream().anyMatch(item -> item.getStatus().equals("DECRYPTION_FAILED"));

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), report.size());
        List<InvoiceRecoveryReportDto> pageContent = start > report.size() ? new ArrayList<>() : report.subList(start, end);
        
        int totalPages = (int) Math.ceil((double) report.size() / pageable.getPageSize());

        return VerifyRecoverResponseDto.builder()
                .content(pageContent)
                .number(pageable.getPageNumber())
                .totalPages(totalPages)
                .totalElements(report.size())
                .hasMismatch(hasMismatch)
                .hasDecFailed(hasDecFailed)
                .build();
    }

    @Override
    public void migrateLegacyInvoices() {
        PublicKey publicKey;
        try {
            File keyFile = new File("keys/public_key.pem");
            if (!keyFile.exists()) {
                generateKeyPair();
            }
            String pubPem = Files.readString(keyFile.toPath(), StandardCharsets.UTF_8);
            publicKey = CryptoUtils.parsePublicKeyPem(pubPem);
        } catch (Exception e) {
            throw new RuntimeException("Không thể tải khóa RSA Public Key để mã hóa di trú", e);
        }

        List<Invoice> paidInvoices = invoiceRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID)
                .collect(Collectors.toList());

        String previousHash = GENESIS_HASH;

        for (Invoice invoice : paidInvoices) {
            String dataStr = buildInvoiceDataString(invoice);
            String currentHash = CryptoUtils.sha256(dataStr + previousHash);

            boolean isUpdated = false;

            if (invoice.getHashValue() == null || !invoice.getHashValue().equals(currentHash)) {
                invoice.setHashValue(currentHash);
                isUpdated = true;
            }

            // Force re-encrypt to ensure all invoices use the LATEST public key
            String encryptedAmt = CryptoUtils.rsaEncrypt(invoice.getTotalPrice().toPlainString(), publicKey);
            invoice.setEncryptedAmount(encryptedAmt);
            isUpdated = true;

            if (isUpdated) {
                invoiceRepository.save(invoice);
            }

            previousHash = currentHash;
        }
    }

    private String buildInvoiceDataString(Invoice invoice) {
        // Format: id | booking_id | room_price | service_price | discount | total_price | paid_at
        return String.format("%d|%d|%s|%s|%s|%s|%s",
                invoice.getId(),
                invoice.getBooking().getId(),
                invoice.getRoomPrice() != null ? invoice.getRoomPrice().toPlainString() : "0.00",
                invoice.getServicePrice() != null ? invoice.getServicePrice().toPlainString() : "0.00",
                invoice.getDiscount() != null ? invoice.getDiscount().toPlainString() : "0.00",
                invoice.getTotalPrice() != null ? invoice.getTotalPrice().toPlainString() : "0.00",
                invoice.getPaidAt() != null ? invoice.getPaidAt().toString() : ""
        );
    }
}
