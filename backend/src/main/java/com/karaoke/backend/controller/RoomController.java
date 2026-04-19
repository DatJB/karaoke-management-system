package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.RoomRequest;
import com.karaoke.backend.dto.request.WeeklyPriceRequest;
import com.karaoke.backend.dto.response.RoomPricingResponse;
import com.karaoke.backend.dto.response.RoomResponse;
import com.karaoke.backend.service.RoomPriceService;
import com.karaoke.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomPriceService roomPriceService;
    private final RoomService roomService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_RECEPTIONIST', 'ROLE_STAFF')")
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_RECEPTIONIST', 'ROLE_STAFF')")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.createRoom(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Integer id, @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> deleteRoom(@PathVariable Integer id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok("Xóa phòng thành công");
    }

    @GetMapping("/prices/weekly")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<RoomPricingResponse> getWeeklyPricing() {
        return ResponseEntity.ok(roomPriceService.getWeeklyPricing());
    }

    @PutMapping("/{roomId}/prices/weekly")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> updateWeeklyPrices(
            @PathVariable Integer roomId,
            @RequestBody List<WeeklyPriceRequest> requests) {
        
        roomPriceService.updateWeeklyPrices(roomId, requests);
        return ResponseEntity.ok("Cập nhật giá tuần thành công");
    }

    @PutMapping("/prices/time-slots")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> updateTimeSlot(@RequestBody List<com.karaoke.backend.dto.request.TimeSlotUpdateRequest> requests) {
        roomPriceService.updateTimeSlots(requests);
        return ResponseEntity.ok("Cập nhật khung giờ thành công");
    }
}
