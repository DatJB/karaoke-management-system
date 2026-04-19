package com.karaoke.backend.repository;

import com.karaoke.backend.entity.RoomPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomPriceRepository extends JpaRepository<RoomPrice, Integer> {
    List<RoomPrice> findByRoomId(Integer roomId);
    void deleteByRoomId(Integer roomId);
    java.util.Optional<RoomPrice> findByRoomIdAndDayOfWeekAndStartTimeAndEndTime(Integer roomId, RoomPrice.DayOfWeek dayOfWeek, java.time.LocalTime startTime, java.time.LocalTime endTime);
    List<RoomPrice> findByStartTimeAndEndTime(java.time.LocalTime startTime, java.time.LocalTime endTime);
}
