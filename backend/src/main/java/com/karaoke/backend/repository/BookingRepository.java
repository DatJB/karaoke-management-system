package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer>
{
    boolean existsByCustomerId(Integer customerId);

    @Query("SELECT b FROM Booking b WHERE b.customer.id = :customerId " +
            "AND (:startDate IS NULL OR b.reservationTime >= :startDate) " +
            "AND (:endDate IS NULL OR b.reservationTime <= :endDate)")
    Page<Booking> findByCustomerWithFilters(
            @Param("customerId") Integer customerId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}
