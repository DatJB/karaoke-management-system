package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.response.BonusPenaltyItemDto;
import com.karaoke.backend.entity.Bonus;
import com.karaoke.backend.entity.Penalty;
import com.karaoke.backend.repository.BonusRepository;
import com.karaoke.backend.repository.PenaltyRepository;
import com.karaoke.backend.service.BonusPenaltyCombinedService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BonusPenaltyCombinedServiceImpl implements BonusPenaltyCombinedService {

    private final BonusRepository bonusRepository;
    private final PenaltyRepository penaltyRepository;

    @Override
    public Page<BonusPenaltyItemDto> getAllCombined(Pageable pageable) {
        List<Bonus> bonuses = bonusRepository.findAll();
        List<Penalty> penalties = penaltyRepository.findAll();
        
        return paginateCombined(bonuses, penalties, pageable);
    }

    @Override
    public Page<BonusPenaltyItemDto> getMyCombined(Integer employeeId, Pageable pageable) {
        List<Bonus> bonuses = bonusRepository.findAll().stream()
                .filter(b -> b.getEmployee().getId().equals(employeeId))
                .collect(Collectors.toList());
        List<Penalty> penalties = penaltyRepository.findAll().stream()
                .filter(p -> p.getEmployee().getId().equals(employeeId))
                .collect(Collectors.toList());

        return paginateCombined(bonuses, penalties, pageable);
    }

    private Page<BonusPenaltyItemDto> paginateCombined(List<Bonus> bonuses, List<Penalty> penalties, Pageable pageable) {
        List<BonusPenaltyItemDto> combined = new ArrayList<>();

        for (Bonus b : bonuses) {
            combined.add(new BonusPenaltyItemDto(
                    b.getId(),
                    "BONUS",
                    b.getType() != null ? b.getType().name() : "OTHER",
                    b.getAmount(),
                    b.getNote(),
                    null,
                    b.getCreatedAt(),
                    b.getEmployee() != null ? b.getEmployee().getId() : null,
                    b.getEmployee() != null ? b.getEmployee().getName() : null
            ));
        }

        for (Penalty p : penalties) {
            combined.add(new BonusPenaltyItemDto(
                    p.getId(),
                    "PENALTY",
                    p.getType() != null ? p.getType().name() : "OTHER",
                    p.getAmount(),
                    p.getReason(),
                    p.getBooking() != null ? p.getBooking().getId() : null,
                    p.getCreatedAt(),
                    p.getEmployee() != null ? p.getEmployee().getId() : null,
                    p.getEmployee() != null ? p.getEmployee().getName() : null
            ));
        }

        combined.sort(Comparator.comparing(BonusPenaltyItemDto::createdAt).reversed());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), combined.size());

        List<BonusPenaltyItemDto> subList;
        if (start <= end) {
            subList = combined.subList(start, end);
        } else {
            subList = new ArrayList<>();
        }

        return new PageImpl<>(subList, pageable, combined.size());
    }
}
