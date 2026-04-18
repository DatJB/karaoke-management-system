package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.CustomerRequest;
import com.karaoke.backend.dto.response.BookingResponse;
import com.karaoke.backend.dto.response.CustomerResponse;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.service.BookingService;
import com.karaoke.backend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController
{
    private final CustomerService customerService;
    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<PageResponse<CustomerResponse>> getAllCustomers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    )
    {
        return ResponseEntity.ok(customerService.getAllCustomers(keyword, page, size));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<CustomerResponse> createCustomer(@RequestBody CustomerRequest request)
    {
        return ResponseEntity.ok(customerService.createCustomer(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Integer id,
            @RequestBody CustomerRequest request
    )
    {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer id)
    {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/bookings")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<PageResponse<BookingResponse>> getCustomerBookings(
            @PathVariable Integer id,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,

            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return ResponseEntity.ok(bookingService.getCustomerBookings(id, date, page, size));
    }
}
