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
