package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.RoomRequest;
import com.karaoke.backend.dto.request.WeeklyPriceRequest;
import com.karaoke.backend.dto.response.RoomPricingResponse;
import com.karaoke.backend.dto.response.RoomResponse;
import com.karaoke.backend.service.RoomPriceService;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.dto.response.RoomResponse;
import com.karaoke.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/rooms")
public class RoomController
{
    private final RoomService roomService;
    private final RoomPriceService roomPriceService;

    @GetMapping("")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponse<RoomResponse>> getAllRooms(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minSize,
            @RequestParam(required = false) Integer maxSize,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(roomService.getAllRooms(category, status, minSize, maxSize, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoomResponse> getRoomDetail(@PathVariable Integer id)
    {
        return ResponseEntity.ok(roomService.getRoomDetail(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest request)
    {
        return ResponseEntity.ok(roomService.createRoom(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer id)
    {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Integer id,
            @RequestBody RoomRequest request
    )
    {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
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

    @GetMapping("/available")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_RECEPTIONIST', 'ROLE_MANAGER')")
    public ResponseEntity<Page<RoomResponse>> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @PageableDefault(size = 8) Pageable pageable)
    {
        Page<RoomResponse> rooms = roomService.findAvailableRooms(start, end, pageable);
        return ResponseEntity.ok(rooms);
    }
}
