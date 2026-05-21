package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    long countByCreatedAtAfter(LocalDateTime startOfDay);
    List<Booking> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT b FROM Booking b JOIN b.bookingRooms br WHERE br.room.id = :roomId AND b.status IN :statuses ORDER BY b.id DESC")
    List<Booking> findByRoomIdAndStatuses(@Param("roomId") Integer roomId, @Param("statuses") Collection<Booking.BookingStatus> statuses);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

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
