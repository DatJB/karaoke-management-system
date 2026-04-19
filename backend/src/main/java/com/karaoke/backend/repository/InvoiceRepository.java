package com.karaoke.backend.repository;

import com.karaoke.backend.dto.response.DashboardResponse;
import com.karaoke.backend.entity.Invoice;
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
}
