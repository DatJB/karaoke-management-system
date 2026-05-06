package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.PenaltyRequestDto;
import com.karaoke.backend.dto.response.PenaltyResponseDto;
import com.karaoke.backend.entity.Employee;
import com.karaoke.backend.entity.PayrollPeriod;
import com.karaoke.backend.entity.Penalty;
import com.karaoke.backend.exception.DataLockedException;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.PayrollPeriodRepository;
import com.karaoke.backend.repository.PenaltyRepository;
import com.karaoke.backend.service.PenaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PenaltyServiceImpl implements PenaltyService {

    private final PenaltyRepository penaltyRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollPeriodRepository payrollPeriodRepository;

    @Override
    @Transactional
    public PenaltyResponseDto createPenalty(PenaltyRequestDto requestDto) {
        final Employee employee = employeeRepository.findById(requestDto.employeeId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        final Penalty penalty = Penalty.builder()
                .employee(employee)
                .type(Penalty.PenaltyType.valueOf(requestDto.type()))
                .amount(requestDto.amount())
                .reason(requestDto.reason())
                .build();
        
        checkIfLocked(java.time.LocalDate.now());

        return mapToDto(penaltyRepository.save(penalty));
    }

    @Override
    @Transactional
    public PenaltyResponseDto updatePenalty(Integer penaltyId, PenaltyRequestDto requestDto) {
        final Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new IllegalArgumentException("Penalty not found"));

        checkIfLocked(penalty.getCreatedAt().toLocalDate());

        penalty.setAmount(requestDto.amount());
        penalty.setType(Penalty.PenaltyType.valueOf(requestDto.type()));
        penalty.setReason(requestDto.reason());

        return mapToDto(penaltyRepository.save(penalty));
    }

    @Override
    @Transactional
    public void deletePenalty(Integer penaltyId) {
        final Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new IllegalArgumentException("Penalty not found"));

        checkIfLocked(penalty.getCreatedAt().toLocalDate());

        penaltyRepository.delete(penalty);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PenaltyResponseDto> getAllPenalties(Pageable pageable) {
        return penaltyRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PenaltyResponseDto> getMyPenalties(Integer employeeId, Pageable pageable) {
        return penaltyRepository.findByEmployeeId(employeeId, pageable).map(this::mapToDto);
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

    private PenaltyResponseDto mapToDto(Penalty p) {
        return new PenaltyResponseDto(
                p.getId(), p.getType().name(), p.getAmount(), p.getReason(),
                p.getBooking() != null ? p.getBooking().getId() : null, p.getCreatedAt()
        );
    }
}
