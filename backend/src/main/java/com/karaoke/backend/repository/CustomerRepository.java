package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    long countByCreatedAtAfter(LocalDateTime startOfDay);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer>
{
    @Query("SELECT c FROM Customer c WHERE " +
            ":keyword IS NULL OR " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "c.phone LIKE CONCAT('%', :keyword, '%') OR " +
            "c.identity LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Customer> searchCustomers(@Param("keyword") String keyword, Pageable pageable);

    boolean existsByPhone(String phone);

    boolean existsByIdentity(String identity);

}
