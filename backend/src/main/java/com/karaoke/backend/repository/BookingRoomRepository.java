package com.karaoke.backend.repository;

import com.karaoke.backend.entity.BookingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingRoomRepository extends JpaRepository<BookingRoom, Integer> {
    Optional<BookingRoom> findByRoomIdAndStatus(Integer roomId, BookingRoom.BookingRoomStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT br FROM BookingRoom br JOIN br.booking b WHERE br.room.id = :roomId AND b.status = :status ORDER BY br.id DESC")
    java.util.List<BookingRoom> findByRoomIdAndBookingStatus(@org.springframework.data.repository.query.Param("roomId") Integer roomId, @org.springframework.data.repository.query.Param("status") com.karaoke.backend.entity.Booking.BookingStatus status);
}
