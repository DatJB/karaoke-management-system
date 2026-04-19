package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.CreateShiftRequest;
import com.karaoke.backend.dto.request.UpdateShiftRequest;
import com.karaoke.backend.dto.response.ShiftResponse;
import com.karaoke.backend.service.ShiftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/shifts")
public class ShiftController
{
    private final ShiftService shiftService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public List<ShiftResponse> getShifts()
    {
        return shiftService.getShifts();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ShiftResponse createShift(
            @Valid @RequestBody CreateShiftRequest request
    ) {
        return shiftService.createShift(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ShiftResponse updateShift(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateShiftRequest request
    ) {
        return shiftService.updateShift(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public Map<String, String> deleteShift(
            @PathVariable Integer id
    ) {
        shiftService.deleteShift(id);
        return Map.of("message", "Xoa ca thanh cong");
    }
}
