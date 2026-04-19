package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.OrderRequest;
import com.karaoke.backend.dto.response.OrderItemResponse;
import com.karaoke.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms/{roomId}/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<List<OrderItemResponse>> getRoomOrders(@PathVariable Integer roomId) {
        return ResponseEntity.ok(orderService.getRoomOrders(roomId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<OrderItemResponse> addOrder(@PathVariable Integer roomId, @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.addOrder(roomId, request));
    }

    @PutMapping("/{itemId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<OrderItemResponse> updateOrderItem(
            @PathVariable Integer roomId,
            @PathVariable Integer itemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(orderService.updateOrderItem(roomId, itemId, quantity));
    }

    @DeleteMapping("/{itemId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<String> deleteOrderItem(@PathVariable Integer roomId, @PathVariable Integer itemId) {
        orderService.deleteOrderItem(roomId, itemId);
        return ResponseEntity.ok("Xóa món khỏi order thành công");
    }
}
