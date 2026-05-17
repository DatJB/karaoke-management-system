package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    long countByCreatedAtAfter(LocalDateTime startOfDay);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT c FROM Customer c WHERE " +
            ":keyword IS NULL OR " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "c.phone LIKE CONCAT('%', :keyword, '%') OR " +
            "c.identity LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Customer> searchCustomers(@Param("keyword") String keyword, Pageable pageable);

    boolean existsByPhone(String phone);

    boolean existsByIdentity(String identity);

    @Query("SELECT c.name, c.phone, MAX(i.createdAt) " +
            "FROM Customer c " +
            "JOIN c.bookings b " +
            "JOIN b.invoice i " +
            "WHERE i.status = 'PAID' " +
            "GROUP BY c.id, c.name, c.phone " +
            "HAVING MAX(i.createdAt) < :cutoffDate " +
            "ORDER BY MAX(i.createdAt) DESC")
    List<Object[]> findSleepingCustomers(LocalDateTime cutoffDate, org.springframework.data.domain.Pageable pageable);
}
