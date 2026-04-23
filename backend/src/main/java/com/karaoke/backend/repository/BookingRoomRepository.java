package com.karaoke.backend.repository;

import com.karaoke.backend.entity.BookingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface BookingRoomRepository extends JpaRepository<BookingRoom, Integer> {
    Optional<BookingRoom> findByRoomIdAndStatus(Integer roomId, BookingRoom.BookingRoomStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT br FROM BookingRoom br JOIN br.booking b WHERE br.room.id = :roomId AND b.status = :status ORDER BY br.id DESC")
    java.util.List<BookingRoom> findByRoomIdAndBookingStatus(@org.springframework.data.repository.query.Param("roomId") Integer roomId, @org.springframework.data.repository.query.Param("status") com.karaoke.backend.entity.Booking.BookingStatus status);

    @Query("SELECT COUNT(br) FROM BookingRoom br " +
            "JOIN br.booking b " +
            "WHERE br.room.id = :roomId " +
            "AND b.id != :currentBookingId " +
            "AND br.status IN ('RESERVED', 'PLAYING') " +
            "AND b.reservationTime < :newEndTime " +
            "AND b.expectedCheckoutTime > :newStartTime")
    long countOverlappingReservations(
            @Param("roomId") Integer roomId,
            @Param("currentBookingId") Integer currentBookingId,
            @Param("newStartTime") LocalDateTime newStartTime,
            @Param("newEndTime") LocalDateTime newEndTime
    );

    @Query("SELECT br FROM BookingRoom br " +
            "WHERE br.room.id = :roomId " +
            "AND br.status = 'RESERVED' " +
            "AND br.checkinTime >= :now " +
            "ORDER BY br.checkinTime ASC LIMIT 1")
    Optional<BookingRoom> findNextUpcomingBooking(@Param("roomId") Integer roomId, @Param("now") LocalDateTime now);

    Optional<BookingRoom> findFirstByRoomIdAndStatusOrderByCheckinTimeAsc(Integer roomId, BookingRoom.BookingRoomStatus bookingRoomStatus);
}
