package com.karaoke.backend.repository;

import com.karaoke.backend.entity.RoomPriceSpecial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomPriceSpecialRepository extends JpaRepository<RoomPriceSpecial, Integer> {
    List<RoomPriceSpecial> findByRoomId(Integer roomId);
    List<RoomPriceSpecial> findByRoomIdAndSpecialDate(Integer roomId, LocalDate specialDate);
}
