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

    @Query("SELECT " +
            "DAYNAME(i.paidAt), SUM(i.totalPrice) " +
            "FROM Invoice i WHERE i.status = 'PAID' " +
            "AND i.paidAt >= :startOfWeek " +
            "GROUP BY DAYNAME(i.paidAt), DAYOFWEEK(i.paidAt) " +
            "ORDER BY DAYOFWEEK(i.paidAt)")
    List<DashboardResponse.WeeklyRevenue> getWeeklyRevenue(@Param("startOfWeek") LocalDateTime startOfWeek);

    @Query("SELECT " +
            "DAYNAME(i.paidAt), SUM(i.totalPrice) " +
            "FROM Invoice i WHERE i.status = 'PAID' " +
            "AND i.paidAt >= :startOfWeek " +
            "GROUP BY DAYNAME(i.paidAt), DAYOFWEEK(i.paidAt) " +
            "ORDER BY DAYOFWEEK(i.paidAt)")
    List<Object[]> getWeeklyRevenueRawData(@Param("startOfWeek") LocalDateTime startOfWeek);

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
    @Query("SELECT MONTH(i.paidAt) as month, SUM(i.totalPrice) as revenue, COUNT(i.id) as count " +
            "FROM Invoice i WHERE i.status = 'PAID' AND YEAR(i.paidAt) = :year " +
            "GROUP BY MONTH(i.paidAt) " +
            "ORDER BY MONTH(i.paidAt)")
    List<Object[]> getMonthlyRevenue(@Param("year") int year);

    @Query("SELECT COUNT(DISTINCT b.customer.id) FROM Booking b WHERE b.status = 'CHECKED_OUT' AND YEAR(b.reservationTime) = :year")
    long countCustomersByYear(@Param("year") int year);

    @Query("SELECT SUM(i.totalPrice) FROM Invoice i WHERE i.createdAt BETWEEN :start AND :end AND i.status = 'PAID'")
    BigDecimal calculateTotalRevenue(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(i.roomPrice) FROM Invoice i WHERE i.createdAt BETWEEN :start AND :end AND i.status = 'PAID'")
    BigDecimal calculateRoomRevenue(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(i.servicePrice) FROM Invoice i WHERE i.createdAt BETWEEN :start AND :end AND i.status = 'PAID'")
    BigDecimal calculateServiceRevenue(LocalDateTime start, LocalDateTime end);

    @Query("SELECT HOUR(i.createdAt) as hr, COUNT(i.id) as cnt " +
            "FROM Invoice i WHERE i.createdAt BETWEEN :start AND :end " +
            "GROUP BY HOUR(i.createdAt) " +
            "ORDER BY cnt DESC")
    List<Object[]> findPeakHours(LocalDateTime start, LocalDateTime end);

    @Query("SELECT r.name, COUNT(i.id) " +
            "FROM Invoice i " +
            "JOIN i.roomDetails rd " +
            "JOIN rd.bookingRoom.room r " +
            "WHERE i.createdAt BETWEEN :start AND :end AND i.status = 'PAID' " +
            "GROUP BY r.name " +
            "ORDER BY COUNT(i.id) DESC")
    List<Object[]> findRoomUtilization(LocalDateTime start, LocalDateTime end);

    @Query("SELECT r.name, SUM(rd.totalPrice) " +
            "FROM Invoice i " +
            "JOIN i.roomDetails rd " +
            "JOIN rd.bookingRoom.room r " +
            "WHERE i.createdAt BETWEEN :start AND :end AND i.status = 'PAID' " +
            "GROUP BY r.name " +
            "ORDER BY SUM(rd.totalPrice) DESC")
    List<Object[]> findRoomRevenueRanking(LocalDateTime start, LocalDateTime end);

    @Query("SELECT c.name, c.phone, SUM(i.totalPrice) " +
            "FROM Invoice i " +
            "JOIN i.booking.customer c " +
            "WHERE i.createdAt BETWEEN :start AND :end AND i.status = 'PAID' " +
            "GROUP BY c.id, c.name, c.phone " +
            "ORDER BY SUM(i.totalPrice) DESC")
    List<Object[]> findTopSpenders(LocalDateTime start, LocalDateTime end, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT c.name, c.phone, COUNT(i.id) " +
            "FROM Invoice i " +
            "JOIN i.booking.customer c " +
            "WHERE i.createdAt BETWEEN :start AND :end AND i.status = 'PAID' " +
            "GROUP BY c.id, c.name, c.phone " +
            "ORDER BY COUNT(i.id) DESC")
    List<Object[]> findMostFrequentCustomers(LocalDateTime start, LocalDateTime end, org.springframework.data.domain.Pageable pageable);
}
