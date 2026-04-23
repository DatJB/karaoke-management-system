package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.response.ServingRoomResponse;
import com.karaoke.backend.entity.BookingRoom;
import com.karaoke.backend.entity.BookingRoomEmployee;
import com.karaoke.backend.entity.Employee;
import com.karaoke.backend.entity.Booking;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.BookingRoomEmployeeRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.service.MeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeServiceImpl implements MeService {

    private final EmployeeRepository employeeRepository;
    private final BookingRoomEmployeeRepository bookingRoomEmployeeRepository;

    @Override
    public List<ServingRoomResponse> getServingRooms(String username) {
        Employee employee = employeeRepository.findByAccountUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for username: " + username));

        List<BookingRoomEmployee> assignments = bookingRoomEmployeeRepository.findByEmployeeId(employee.getId());

        return assignments.stream()
                .map(BookingRoomEmployee::getBookingRoom)
                .filter(br -> br.getBooking().getStatus() == Booking.BookingStatus.CHECKED_IN || 
                              br.getBooking().getStatus() == Booking.BookingStatus.BOOKED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ServingRoomResponse mapToResponse(BookingRoom br) {
        Booking booking = br.getBooking();
        return ServingRoomResponse.builder()
                .roomId(br.getRoom().getId())
                .roomName(br.getRoom().getName())
                .roomCategory(br.getRoom().getCategory().name())
                .roomSize(br.getRoom().getSize())
                .roomStatus(br.getRoom().getStatus().name())
                .bookingId(booking.getId())
                .customerName(booking.getCustomer() != null ? booking.getCustomer().getName() : "Khách vãng lai")
                .checkInTime(booking.getReservationTime())
                .status(booking.getStatus().name())
                .build();
    }
}
