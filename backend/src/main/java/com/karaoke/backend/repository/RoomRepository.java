package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    long countByStatus(Room.RoomStatus status);
}
