package com.karaoke.backend.repository;

import com.karaoke.backend.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Integer> {
    List<InvoiceItem> findByInvoiceId(Integer invoiceId);

    @Query("SELECT CONCAT('- ', i.product.name, ': ', SUM(i.quantity), ' phần') " +
            "FROM InvoiceItem i " +
            "WHERE i.invoice.createdAt BETWEEN :start AND :end AND i.invoice.status = 'PAID' " +
            "GROUP BY i.product.name " +
            "ORDER BY SUM(i.quantity) DESC")
    List<String> findTopSellingItemsAsStrings(LocalDateTime start, LocalDateTime end, org.springframework.data.domain.Pageable pageable);
}
