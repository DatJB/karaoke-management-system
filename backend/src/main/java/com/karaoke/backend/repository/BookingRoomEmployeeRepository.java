package com.karaoke.backend.repository;

import com.karaoke.backend.entity.BookingRoomEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRoomEmployeeRepository extends JpaRepository<BookingRoomEmployee, Integer> {
    List<BookingRoomEmployee> findByEmployeeId(Integer employeeId);
}
