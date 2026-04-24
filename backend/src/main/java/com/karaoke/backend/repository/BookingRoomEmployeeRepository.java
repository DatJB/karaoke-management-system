package com.karaoke.backend.repository;

import com.karaoke.backend.entity.BookingRoomEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRoomEmployeeRepository extends JpaRepository<BookingRoomEmployee, Integer> {
    List<BookingRoomEmployee> findByEmployeeId(Integer employeeId);

    @org.springframework.data.jpa.repository.Query("SELECT bre FROM BookingRoomEmployee bre JOIN bre.bookingRoom br WHERE bre.employee.id = :employeeId AND br.status = :status")
    List<BookingRoomEmployee> findByEmployeeIdAndBookingRoomStatus(@org.springframework.data.repository.query.Param("employeeId") Integer employeeId, @org.springframework.data.repository.query.Param("status") com.karaoke.backend.entity.BookingRoom.BookingRoomStatus status);
}

    @Query(value = "SELECT bre.employee_id AS employeeId, " +
            "SUM(TIME_TO_SEC(TIMEDIFF(br.checkout_time, br.checkin_time)) / 3600.0) AS totalHours " +
            "FROM booking_room_employee bre " +
            "JOIN booking_room br ON bre.booking_room_id = br.id " +
            "WHERE br.checkout_time >= :start AND br.checkout_time <= :end " +
            "GROUP BY bre.employee_id",
            nativeQuery = true)
    List<Object[]> aggregateServiceHours(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<BookingRoomEmployee> findByEmployeeIdAndBookingRoomCheckoutTimeBetween(Integer employeeId, LocalDateTime start, LocalDateTime end);
}
