package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.BonusRequestDto;
import com.karaoke.backend.dto.response.BonusResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BonusService {
    BonusResponseDto createBonus(BonusRequestDto requestDto);
    BonusResponseDto updateBonus(Integer bonusId, BonusRequestDto requestDto);
    void deleteBonus(Integer bonusId);
    Page<BonusResponseDto> getAllBonuses(Pageable pageable);
    Page<BonusResponseDto> getMyBonuses(Integer employeeId, Pageable pageable);
}
