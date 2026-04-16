package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer>
{
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
}
