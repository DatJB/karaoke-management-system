package com.karaoke.backend.repository;

import com.karaoke.backend.dto.response.DashboardResponse;
import com.karaoke.backend.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    @Query("SELECT SUM(i.totalPrice) FROM Invoice i WHERE i.status = 'PAID' " +
            "AND i.paidAt >= CURRENT_DATE")
    BigDecimal sumTodayRevenue();
    List<Invoice> findTop5ByStatusOrderByPaidAtDesc(Invoice.InvoiceStatus status);

    @Query("SELECT new com.karaoke.backend.dto.response.DashboardResponse$WeeklyRevenue(" +
            "DAYNAME(i.paidAt), SUM(i.totalPrice)) " +
            "FROM Invoice i WHERE i.status = 'PAID' " +
            "AND i.paidAt >= :startOfWeek " +
            "GROUP BY DAYNAME(i.paidAt), DAYOFWEEK(i.paidAt) " +
            "ORDER BY DAYOFWEEK(i.paidAt)")
    List<DashboardResponse.WeeklyRevenue> getWeeklyRevenue(@Param("startOfWeek") LocalDateTime startOfWeek);

    @Query("SELECT SUM(i.totalPrice) FROM Invoice i WHERE i.status = 'PAID' " +
            "AND i.paidAt BETWEEN :start AND :end")
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    boolean existsByBookingId(Integer bookingId);

    @Query("SELECT i FROM Invoice i " +
            "JOIN i.booking b " +
            "LEFT JOIN b.customer c " +
            "WHERE (:status IS NULL OR i.status = :status) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "c.identity LIKE CONCAT('%', :keyword, '%') OR " +
            "c.phone LIKE CONCAT('%', :keyword, '%')) " +
            "AND (cast(:startDate as timestamp) IS NULL OR i.createdAt >= :startDate) " +
            "AND (cast(:endDate as timestamp) IS NULL OR i.createdAt <= :endDate) ")
    Page<Invoice> searchInvoices(
            @Param("status") Invoice.InvoiceStatus status,
            @Param("keyword") String keyword,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
}
