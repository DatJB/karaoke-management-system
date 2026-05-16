package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.PenaltyRequestDto;
import com.karaoke.backend.dto.response.PenaltyResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PenaltyService {
    PenaltyResponseDto createPenalty(PenaltyRequestDto requestDto);
    PenaltyResponseDto updatePenalty(Integer penaltyId, PenaltyRequestDto requestDto);
    void deletePenalty(Integer penaltyId);
    Page<PenaltyResponseDto> getAllPenalties(Pageable pageable);
    Page<PenaltyResponseDto> getMyPenalties(Integer employeeId, Pageable pageable);
}
