package com.karaoke.backend.repository;

import com.karaoke.backend.entity.RoomPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.Optional;

@Repository
public interface RoomPriceRepository extends JpaRepository<RoomPrice, Integer>
{
    @Query("SELECT p.pricePerHour FROM RoomPrice p " +
            "WHERE p.room.id = :roomId AND p.dayOfWeek = :day " +
            "AND :now BETWEEN p.startTime AND p.endTime")
    Double findPrice(@Param("roomId") Integer roomId, @Param("day") RoomPrice.DayOfWeek day, @Param("now") LocalTime now);

    @Query("SELECT p FROM RoomPrice p " +
            "WHERE p.room.id = :roomId AND p.dayOfWeek = :day " +
            "AND p.startTime <= :now AND p.endTime > :now")
    Optional<RoomPrice> findActiveNormalPrice(
            @Param("roomId") Integer roomId,
            @Param("day") RoomPrice.DayOfWeek day,
            @Param("now") LocalTime now);
}

