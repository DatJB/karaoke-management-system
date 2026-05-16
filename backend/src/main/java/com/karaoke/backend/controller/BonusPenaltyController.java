package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.BonusRequestDto;
import com.karaoke.backend.dto.response.BonusResponseDto;
import com.karaoke.backend.dto.request.PenaltyRequestDto;
import com.karaoke.backend.dto.response.PenaltyResponseDto;
import com.karaoke.backend.dto.response.ApiResponse;
import com.karaoke.backend.dto.response.BonusPenaltyItemDto;
import com.karaoke.backend.repository.AccountRepository;
import com.karaoke.backend.service.BonusService;
import com.karaoke.backend.service.PenaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BonusPenaltyController {

    private final BonusService bonusService;
    private final PenaltyService penaltyService;
    private final com.karaoke.backend.service.BonusPenaltyCombinedService combinedService;
    private final AccountRepository accountRepository;

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PostMapping("/bonuses")
    public ResponseEntity<ApiResponse<BonusResponseDto>> createBonus(@RequestBody BonusRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Bonus created", bonusService.createBonus(request)));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/bonuses/{id}")
    public ResponseEntity<ApiResponse<BonusResponseDto>> updateBonus(@PathVariable Integer id, @RequestBody BonusRequestDto request) {
        return ResponseEntity.ok(new ApiResponse<>("Bonus updated", bonusService.updateBonus(id, request)));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @DeleteMapping("/bonuses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBonus(@PathVariable Integer id) {
        bonusService.deleteBonus(id);
        return ResponseEntity.ok(new ApiResponse<>("Bonus deleted", null));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/bonuses")
    public ResponseEntity<ApiResponse<Page<BonusResponseDto>>> getAllBonuses(Pageable pageable) {
        return ResponseEntity.ok(new ApiResponse<>("Success", bonusService.getAllBonuses(pageable)));
    }

    @PreAuthorize("hasAnyRole('STAFF', 'RECEPTIONIST')")
    @GetMapping("/bonuses/me")
    public ResponseEntity<ApiResponse<Page<BonusResponseDto>>> getMyBonuses(Pageable pageable) {
        Integer employeeId = getCurrentEmployeeId();
        return ResponseEntity.ok(new ApiResponse<>("Success", bonusService.getMyBonuses(employeeId, pageable)));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PostMapping("/penalties")
    public ResponseEntity<ApiResponse<PenaltyResponseDto>> createPenalty(@RequestBody PenaltyRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Penalty created", penaltyService.createPenalty(request)));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/penalties/{id}")
    public ResponseEntity<ApiResponse<PenaltyResponseDto>> updatePenalty(@PathVariable Integer id, @RequestBody PenaltyRequestDto request) {
        return ResponseEntity.ok(new ApiResponse<>("Penalty updated", penaltyService.updatePenalty(id, request)));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @DeleteMapping("/penalties/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePenalty(@PathVariable Integer id) {
        penaltyService.deletePenalty(id);
        return ResponseEntity.ok(new ApiResponse<>("Penalty deleted", null));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/penalties")
    public ResponseEntity<ApiResponse<Page<PenaltyResponseDto>>> getAllPenalties(Pageable pageable) {
        return ResponseEntity.ok(new ApiResponse<>("Success", penaltyService.getAllPenalties(pageable)));
    }

    @PreAuthorize("hasAnyRole('STAFF', 'RECEPTIONIST')")
    @GetMapping("/penalties/me")
    public ResponseEntity<ApiResponse<Page<PenaltyResponseDto>>> getMyPenalties(Pageable pageable) {
        Integer employeeId = getCurrentEmployeeId();
        return ResponseEntity.ok(new ApiResponse<>("Success", penaltyService.getMyPenalties(employeeId, pageable)));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/bonuses-penalties")
    public ResponseEntity<ApiResponse<Page<BonusPenaltyItemDto>>> getAllCombined(Pageable pageable) {
        return ResponseEntity.ok(new ApiResponse<>("Success", combinedService.getAllCombined(pageable)));
    }

    @PreAuthorize("hasAnyRole('STAFF', 'RECEPTIONIST')")
    @GetMapping("/bonuses-penalties/me")
    public ResponseEntity<ApiResponse<Page<BonusPenaltyItemDto>>> getMyCombined(Pageable pageable) {
        Integer employeeId = getCurrentEmployeeId();
        return ResponseEntity.ok(new ApiResponse<>("Success", combinedService.getMyCombined(employeeId, pageable)));
    }

    private Integer getCurrentEmployeeId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return accountRepository.findByUsername(username)
                .map(account -> account.getEmployee().getId())
                .orElseThrow(() -> new IllegalArgumentException("Employee account not found for current user"));
    }
}
