package com.karaoke.backend.repository;

import com.karaoke.backend.entity.RoomPriceSpecial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface RoomPriceSpecialRepository extends JpaRepository<RoomPriceSpecial, Integer>
{
    @Query("SELECT p.pricePerHour FROM RoomPriceSpecial p " +
            "WHERE p.room.id = :roomId AND p.specialDate = :today " +
            "AND :now BETWEEN p.startTime AND p.endTime")
    Double findPrice(Integer roomId, LocalDate today, LocalTime now);
}
