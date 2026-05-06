package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.BonusPenaltyItemDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BonusPenaltyCombinedService {
    Page<BonusPenaltyItemDto> getAllCombined(Pageable pageable);
    Page<BonusPenaltyItemDto> getMyCombined(Integer employeeId, Pageable pageable);
}
