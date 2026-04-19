package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.RoomPriceSpecialRequest;
import com.karaoke.backend.dto.response.RoomPriceSpecialResponse;
import com.karaoke.backend.service.RoomPriceSpecialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RoomPriceSpecialController {

    private final RoomPriceSpecialService roomPriceSpecialService;

    @PostMapping("/rooms/{roomId}/prices/special")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<RoomPriceSpecialResponse>> addSpecialPrices(
            @PathVariable Integer roomId,
            @RequestBody List<RoomPriceSpecialRequest> requests) {
        return ResponseEntity.ok(roomPriceSpecialService.addSpecialPrices(roomId, requests));
    }

    @GetMapping("/rooms/{roomId}/prices/special")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<RoomPriceSpecialResponse>> getSpecialPricesByRoom(
            @PathVariable Integer roomId) {
        return ResponseEntity.ok(roomPriceSpecialService.getSpecialPricesByRoom(roomId));
    }

    @PutMapping("/prices/special/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<RoomPriceSpecialResponse> updateSpecialPrice(
            @PathVariable Integer id,
            @RequestBody RoomPriceSpecialRequest request) {
        return ResponseEntity.ok(roomPriceSpecialService.updateSpecialPrice(id, request));
    }

    @DeleteMapping("/prices/special/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> deleteSpecialPrice(@PathVariable Integer id) {
        roomPriceSpecialService.deleteSpecialPrice(id);
        return ResponseEntity.ok("Xóa giá đặc biệt thành công");
    }
}
