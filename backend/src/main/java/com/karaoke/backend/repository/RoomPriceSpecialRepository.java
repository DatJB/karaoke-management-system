package com.karaoke.backend.repository;

import com.karaoke.backend.entity.RoomPriceSpecial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomPriceSpecialRepository extends JpaRepository<RoomPriceSpecial, Integer> {
    List<RoomPriceSpecial> findByRoomId(Integer roomId);
    List<RoomPriceSpecial> findByRoomIdAndSpecialDate(Integer roomId, LocalDate specialDate);

    @Query("SELECT p.pricePerHour FROM RoomPriceSpecial p " +
            "WHERE p.room.id = :roomId AND p.specialDate = :today " +
            "AND :now BETWEEN p.startTime AND p.endTime")
    Double findPrice(Integer roomId, LocalDate today, LocalTime now);

    @Query("SELECT p FROM RoomPriceSpecial p " +
            "WHERE p.room.id = :roomId AND p.specialDate = :today " +
            "AND p.startTime <= :now AND p.endTime > :now")
    Optional<RoomPriceSpecial> findActiveSpecialPrice(
            @Param("roomId") Integer roomId,
            @Param("today") LocalDate today,
            @Param("now") LocalTime now);
}
