package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    long countByStatus(Room.RoomStatus status);

    boolean existsByName(String name);

    @Query("SELECT r FROM Room r WHERE " +
                  "(:category IS NULL OR r.category = :category) AND " +
                  "(:status IS NULL OR r.status = :status) AND " +
                  "(:minSize IS NULL OR r.size >= :minSize) AND " +
                  "(:maxSize IS NULL OR r.size <= :maxSize)")
    Page<Room> filterRooms(@Param("category") Room.RoomCategory category,
                           @Param("status") Room.RoomStatus status,
                           @Param("minSize") Integer minSize,
                           @Param("maxSize") Integer maxSize,
                           Pageable pageable);

    @Query("SELECT r FROM Room r WHERE r.status = 'AVAILABLE' AND r.id NOT IN (" +
            "    SELECT br.room.id FROM BookingRoom br " +
            "    JOIN br.booking b " +
            "    WHERE b.status <> 'CANCELLED' " +
            "    AND (:startTime < b.expectedCheckoutTime AND :endTime > b.reservationTime)" +
            ")")
    Page<Room> findAvailableRooms(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );
}
