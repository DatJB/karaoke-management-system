package com.karaoke.backend.repository;

import com.karaoke.backend.entity.BookingRoomEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRoomEmployeeRepository extends JpaRepository<BookingRoomEmployee, Integer> {
    List<BookingRoomEmployee> findByEmployeeId(Integer employeeId);

    @org.springframework.data.jpa.repository.Query("SELECT bre FROM BookingRoomEmployee bre JOIN bre.bookingRoom br WHERE bre.employee.id = :employeeId AND br.status = :status")
    List<BookingRoomEmployee> findByEmployeeIdAndBookingRoomStatus(@org.springframework.data.repository.query.Param("employeeId") Integer employeeId, @org.springframework.data.repository.query.Param("status") com.karaoke.backend.entity.BookingRoom.BookingRoomStatus status);
}
