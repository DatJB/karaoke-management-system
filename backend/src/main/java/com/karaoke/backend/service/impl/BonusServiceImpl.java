package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.BonusRequestDto;
import com.karaoke.backend.dto.response.BonusResponseDto;
import com.karaoke.backend.entity.Bonus;
import com.karaoke.backend.entity.Employee;
import com.karaoke.backend.entity.PayrollPeriod;
import com.karaoke.backend.exception.DataLockedException;
import com.karaoke.backend.repository.BonusRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.PayrollPeriodRepository;
import com.karaoke.backend.service.BonusService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BonusServiceImpl implements BonusService {

    private final BonusRepository bonusRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollPeriodRepository payrollPeriodRepository;

    @Override
    @Transactional
    public BonusResponseDto createBonus(BonusRequestDto requestDto) {
        final Employee employee = employeeRepository.findById(requestDto.employeeId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        final Bonus bonus = Bonus.builder()
                .employee(employee)
                .type(Bonus.BonusType.valueOf(requestDto.type()))
                .amount(requestDto.amount())
                .note(requestDto.note())
                .build();

        checkIfLocked(java.time.LocalDate.now());

        return mapToDto(bonusRepository.save(bonus));
    }

    @Override
    @Transactional
    public BonusResponseDto updateBonus(Integer bonusId, BonusRequestDto requestDto) {
        final Bonus bonus = bonusRepository.findById(bonusId)
                .orElseThrow(() -> new IllegalArgumentException("Bonus not found"));

        checkIfLocked(bonus.getCreatedAt().toLocalDate());

        bonus.setAmount(requestDto.amount());
        bonus.setType(Bonus.BonusType.valueOf(requestDto.type()));
        bonus.setNote(requestDto.note());

        return mapToDto(bonusRepository.save(bonus));
    }

    @Override
    @Transactional
    public void deleteBonus(Integer bonusId) {
        final Bonus bonus = bonusRepository.findById(bonusId)
                .orElseThrow(() -> new IllegalArgumentException("Bonus not found"));

        checkIfLocked(bonus.getCreatedAt().toLocalDate());

        bonusRepository.delete(bonus);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BonusResponseDto> getAllBonuses(Pageable pageable) {
        return bonusRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BonusResponseDto> getMyBonuses(Integer employeeId, Pageable pageable) {
        return bonusRepository.findByEmployeeId(employeeId, pageable).map(this::mapToDto);
    }

    private void checkIfLocked(java.time.LocalDate date) {
        boolean locked = payrollPeriodRepository.isDateLocked(date, List.of(
                PayrollPeriod.PayrollPeriodStatus.APPROVED,
                PayrollPeriod.PayrollPeriodStatus.PAID
        ));
        if (locked) {
            throw new DataLockedException("This date falls within an APPROVED or PAID payroll period. Data is locked.");
        }
    }

    private BonusResponseDto mapToDto(Bonus b) {
        return new BonusResponseDto(
                b.getId(), b.getType().name(), b.getAmount(), b.getNote(), b.getCreatedAt()
        );
    }
}
