package com.karaoke.backend.controller;

import com.karaoke.backend.entity.BookingRoomEmployee;
import com.karaoke.backend.service.BookingRoomEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms/{roomId}/employees")
@RequiredArgsConstructor
public class BookingRoomEmployeeController {
    private final BookingRoomEmployeeService bookingRoomEmployeeService;

    @PostMapping("/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<String> assignEmployee(@PathVariable Integer roomId, @PathVariable Integer employeeId) {
        bookingRoomEmployeeService.addEmployeeToRoom(roomId, employeeId);
        return ResponseEntity.ok("Phân công nhân viên thành công");
    }

    @DeleteMapping("/{employeeId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<String> removeEmployee(@PathVariable Integer roomId, @PathVariable Integer employeeId) {
        bookingRoomEmployeeService.removeEmployeeFromRoom(roomId, employeeId);
        return ResponseEntity.ok("Hủy phân công nhân viên thành công");
    }
}
