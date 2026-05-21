package com.karaoke.backend.security.service;

import com.karaoke.backend.dto.response.InvoiceRecoveryReportDto;
import com.karaoke.backend.dto.response.InvoiceTamperReportDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InvoiceSecurityService {
    
    /**
     * Generates a new RSA 2048-bit key pair.
     * The Public Key PEM is saved to a server config/resource location.
     * The Private Key PEM is returned as a string so that the owner can download it.
     */
    String generateKeyPair();

    /**
     * Loops through all PAID invoices and validates the SHA-256 chaining hash.
     * Returns a detailed list of integrity status for each invoice.
     */
    Page<InvoiceTamperReportDto> verifyInvoiceChain(Pageable pageable);

    /**
     * Resolves the real amount for each invoice by decrypting `encrypted_amount`
     * with the owner's uploaded Private Key PEM on RAM.
     * Compares it against `total_price` in the DB and returns discrepancy details.
     */
    Page<InvoiceRecoveryReportDto> verifyAndRecoverAmounts(String privateKeyPem, Pageable pageable);

    /**
     * Secures and migrates all legacy PAID invoices by calculating their chaining
     * SHA-256 hashes and encrypting their total amounts using the RSA public key.
     */
    void migrateLegacyInvoices();
}
