package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.BookingCreateRequest;
import com.karaoke.backend.dto.request.BookingUpdateRequest;
import com.karaoke.backend.dto.response.BookingDetailResponse;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController
{
    private final BookingService bookingService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<BookingDetailResponse> getBookingDetail(@PathVariable Integer id)
    {
        return ResponseEntity.ok(bookingService.getBookingDetail(id));
    }

    @PostMapping("/{bookingId}/rooms/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Void> addRoomToBooking(
            @PathVariable Integer bookingId,
            @PathVariable Integer roomId)
    {
        bookingService.addRoomToBooking(bookingId, roomId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<BookingDetailResponse> updateBookingInfo(
            @PathVariable Integer bookingId,
            @Valid @RequestBody BookingUpdateRequest request)
    {
        BookingDetailResponse updatedBooking = bookingService.updateBookingInfo(bookingId, request);
        return ResponseEntity.ok(updatedBooking);
    }

    @DeleteMapping("/{bookingId}/rooms/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Void> removeRoomFromBooking(
            @PathVariable Integer bookingId,
            @PathVariable Integer roomId)
    {
        bookingService.removeRoomFromBooking(bookingId, roomId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{bookingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBooking(@PathVariable Integer bookingId)
    {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{bookingId}/rooms/{roomId}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Void> checkInSingleRoom(
            @PathVariable Integer bookingId,
            @PathVariable Integer roomId)
    {
        bookingService.checkInSingleRoom(bookingId, roomId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Void> checkInAllRooms(@PathVariable Integer id)
    {
        bookingService.checkInAllRooms(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<BookingDetailResponse> createBooking(@Valid @RequestBody BookingCreateRequest request)
    {
        BookingDetailResponse createdBooking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }

    @PostMapping("/{bookingId}/rooms/{roomId}/checkout")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Void> checkoutSingleRoom(
            @PathVariable Integer bookingId,
            @PathVariable Integer roomId)
    {
        bookingService.checkOutSingleRoom(bookingId, roomId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Void> checkoutAllRooms(@PathVariable Integer id)
    {
        bookingService.checkOutAllRooms(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Void> cancelBooking(@PathVariable Integer id)
    {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok().build();
    }
}
