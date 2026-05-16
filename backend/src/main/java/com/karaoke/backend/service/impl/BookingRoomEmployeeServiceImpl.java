package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.response.RoomEmployeeResponse;
import com.karaoke.backend.entity.BookingRoom;
import com.karaoke.backend.entity.BookingRoomEmployee;
import com.karaoke.backend.entity.Employee;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.BookingRoomEmployeeRepository;
import com.karaoke.backend.repository.BookingRoomRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.service.BookingRoomEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingRoomEmployeeServiceImpl implements BookingRoomEmployeeService {

    private final BookingRepository bookingRepository;
    private final BookingRoomRepository bookingRoomRepository;
    private final EmployeeRepository employeeRepository;
    private final BookingRoomEmployeeRepository bookingRoomEmployeeRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public List<RoomEmployeeResponse> getRoomEmployee(Integer roomId)
    {
        BookingRoom bookingRoom = bookingRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng."));

        List<BookingRoomEmployee> employees = bookingRoom.getEmployees();

        return employees.stream()
                .map(emp -> RoomEmployeeResponse.builder()
                        .id(emp.getId())
                        .employeeId(emp.getEmployee().getId())
                        .employeeCode(emp.getEmployee().getCode())
                        .employeeName(emp.getEmployee().getName())
                        .startTime(emp.getStartTime())
                        .endTime(emp.getEndTime())
                        .build()
                )
                .toList();
    }

    @Override
    @Transactional
    public void addEmployeeToRoom(Integer roomId, Integer employeeId) {
        BookingRoom bookingRoom = findActiveBookingRoom(roomId);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));

        if (employee.getStatus() == Employee.EmployeeStatus.OFF) {
            throw new IllegalStateException("Nhân viên đang trong trạng thái nghỉ (OFF), không thể phân công.");
        }

        Optional<BookingRoomEmployee> existingAssignmentOpt = bookingRoom.getEmployees().stream()
                .filter(e -> e.getEmployee().getId().equals(employeeId))
                .findFirst();

        if (existingAssignmentOpt.isPresent()) {
            BookingRoomEmployee existingAssignment = existingAssignmentOpt.get();
            if (existingAssignment.getEndTime() == null) {
                throw new IllegalArgumentException("Nhân viên này đã được phân công vào phòng này rồi");
            }
            // Re-activate
            existingAssignment.setEndTime(null);
            existingAssignment.setStartTime(LocalDateTime.now());
            bookingRoomEmployeeRepository.save(existingAssignment);
            employee.setStatus(Employee.EmployeeStatus.BUSY);
            employeeRepository.save(employee);
            return;
        }

        List<BookingRoomEmployee> activeAssignments = bookingRoomEmployeeRepository
                .findByEmployeeIdAndBookingRoomStatus(employeeId, BookingRoom.BookingRoomStatus.PLAYING);
        boolean busyElsewhere = activeAssignments.stream()
                .anyMatch(a -> !a.getBookingRoom().getId().equals(bookingRoom.getId()) && a.getEndTime() == null);
        if (busyElsewhere) {
            BookingRoom activeRoom = activeAssignments.stream()
                    .filter(a -> !a.getBookingRoom().getId().equals(bookingRoom.getId()) && a.getEndTime() == null)
                    .findFirst().get().getBookingRoom();
            throw new IllegalStateException("Nhân viên đang phục vụ tại phòng " + activeRoom.getRoom().getName() + ", không thể phân công thêm phòng khác.");
        }

        BookingRoomEmployee assignment = BookingRoomEmployee.builder()
                .bookingRoom(bookingRoom)
                .employee(employee)
                .startTime(LocalDateTime.now())
                .build();

        bookingRoomEmployeeRepository.save(assignment);

        employee.setStatus(Employee.EmployeeStatus.BUSY);
        employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public void removeEmployeeFromRoom(Integer roomId, Integer employeeId) {
        BookingRoom bookingRoom = findActiveBookingRoom(roomId);

        BookingRoomEmployee assignment = bookingRoom.getEmployees().stream()
                .filter(e -> e.getEmployee().getId().equals(employeeId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên này không phục vụ phòng này"));

//        bookingRoom.getEmployees().remove(assignment);
//        entityManager.remove(entityManager.contains(assignment) ? assignment : entityManager.merge(assignment));
//        entityManager.flush();

        assignment.setEndTime(LocalDateTime.now());
        bookingRoomEmployeeRepository.save(assignment);

        Employee employee = assignment.getEmployee();
        employee.setStatus(Employee.EmployeeStatus.AVAILABLE);
        employeeRepository.save(employee);
    }

    private BookingRoom findActiveBookingRoom(Integer roomId) {
        java.util.List<BookingRoom> activeRooms = bookingRoomRepository.findByRoomIdAndBookingStatus(
                roomId, com.karaoke.backend.entity.Booking.BookingStatus.CHECKED_IN);
        
        if (activeRooms.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy đơn đặt phòng đang hoạt động (CHECKED_IN) cho phòng ID: " + roomId);
        }
        
        return activeRooms.get(0);
    }
}
