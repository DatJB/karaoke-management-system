package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.EmployeePayrollDetailDto;
import com.karaoke.backend.dto.PayrollDto;
import com.karaoke.backend.dto.PayrollPeriodRequestDto;
import com.karaoke.backend.dto.BonusResponseDto;
import com.karaoke.backend.dto.PenaltyResponseDto;
import com.karaoke.backend.entity.*;
import com.karaoke.backend.exception.PayrollPeriodAlreadyApprovedException;
import com.karaoke.backend.repository.*;
import com.karaoke.backend.service.PayrollPeriodService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollPeriodServiceImpl implements PayrollPeriodService {

    private final PayrollPeriodRepository payrollPeriodRepository;
    private final PayrollRepository payrollRepository;
    private final BookingRoomEmployeeRepository bookingRoomEmployeeRepository;
    private final PenaltyRepository penaltyRepository;
    private final BonusRepository bonusRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public PayrollPeriod createPeriod(PayrollPeriodRequestDto requestDto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        final PayrollPeriod period = PayrollPeriod.builder()
                .name(requestDto.name())
                .periodStart(requestDto.periodStart())
                .periodEnd(requestDto.periodEnd())
                .status(PayrollPeriod.PayrollPeriodStatus.DRAFT)
                .createdBy(account)
                .build();
        return payrollPeriodRepository.save(period);
    }

    @Override
    @Transactional
    public PayrollPeriod updatePeriodStatus(Integer periodId, PayrollPeriod.PayrollPeriodStatus status) {
        final PayrollPeriod period = payrollPeriodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Period not found"));
        period.setStatus(status);
        return payrollPeriodRepository.save(period);
    }

    @Override
    @Transactional
    public void deletePeriod(Integer periodId) {
        final PayrollPeriod period = payrollPeriodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Period not found"));
        if (period.getStatus() != PayrollPeriod.PayrollPeriodStatus.DRAFT) {
            throw new PayrollPeriodAlreadyApprovedException("Cannot delete approved or paid period");
        }
        payrollPeriodRepository.delete(period);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PayrollDto> getPayrollsByPeriod(Integer periodId, Pageable pageable) {
        return payrollRepository.findByPayrollPeriodId(periodId, pageable)
                .map(this::mapToPayrollDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PayrollDto> getMyPayrolls(Integer employeeId, Pageable pageable) {
        return payrollRepository.findByEmployeeId(employeeId, pageable)
                .map(this::mapToPayrollDto);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeePayrollDetailDto getEmployeePayrollDetails(Integer periodId, Integer employeeId) {
        final PayrollPeriod period = payrollPeriodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Period not found"));
        
        final Payroll payroll = payrollRepository.findByPayrollPeriodIdAndEmployeeId(periodId, employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll not calculated for this employee in this period"));

        final LocalDateTime startOfDay = period.getPeriodStart().atStartOfDay();
        final LocalDateTime endOfDay = period.getPeriodEnd().atTime(LocalTime.MAX);

        final List<BookingRoomEmployee> sessions = bookingRoomEmployeeRepository
                .findByEmployeeIdAndBookingRoomCheckoutTimeBetween(employeeId, startOfDay, endOfDay);
                
        final List<Penalty> allPenalties = penaltyRepository
                .findByEmployeeIdAndCreatedAtBetween(employeeId, startOfDay, endOfDay);
                
        final List<Bonus> allBonuses = bonusRepository
                .findByEmployeeIdAndCreatedAtBetween(employeeId, startOfDay, endOfDay);

        final List<EmployeePayrollDetailDto.ServiceHistory> serviceHistories = sessions.stream().map(session -> {
            final BookingRoom br = session.getBookingRoom();
            final BigDecimal duration = calculateDurationInHours(br.getCheckinTime(), br.getCheckoutTime());

            final BigDecimal rate = payroll.getEmployee().getSalaryPerHour() != null ? payroll.getEmployee().getSalaryPerHour() : BigDecimal.ZERO;
            final BigDecimal earned = duration.multiply(rate);

            final List<PenaltyResponseDto> bookingPenalties = allPenalties.stream()
                    .filter(p -> p.getBooking() != null && p.getBooking().getId().equals(br.getBooking().getId()))
                    .map(this::mapToPenaltyDto)
                    .collect(Collectors.toList());

            return new EmployeePayrollDetailDto.ServiceHistory(
                    br.getBooking().getId(),
                    br.getRoom().getId(),
                    br.getRoom().getName(),
                    br.getCheckinTime(),
                    br.getCheckoutTime(),
                    duration,
                    earned,
                    bookingPenalties
            );
        }).collect(Collectors.toList());

        final List<PenaltyResponseDto> otherPenalties = allPenalties.stream()
                .filter(p -> p.getBooking() == null)
                .map(this::mapToPenaltyDto)
                .collect(Collectors.toList());

        final List<BonusResponseDto> bonuses = allBonuses.stream()
                .map(this::mapToBonusDto)
                .collect(Collectors.toList());

        final EmployeePayrollDetailDto.Summary summary = new EmployeePayrollDetailDto.Summary(
                payroll.getBaseSalary(),
                payroll.getTotalWorkHours(),
                payroll.getSalaryFromHours(),
                payroll.getTotalBonus(),
                payroll.getTotalPenalty(),
                payroll.getTotalSalary()
        );

        final String role = (payroll.getEmployee().getAccount() != null) ? 
                            payroll.getEmployee().getAccount().getRole().name() : "STAFF";

        return new EmployeePayrollDetailDto(
                employeeId,
                payroll.getEmployee().getName(),
                role,
                summary,
                serviceHistories,
                otherPenalties,
                bonuses
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PayrollPeriod> getAllPeriods(Pageable pageable) {
        return payrollPeriodRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollDto> getAllPayrollsByPeriodForExport(Integer periodId) {
        return payrollRepository.findByPayrollPeriodId(periodId, Pageable.unpaged())
                .getContent()
                .stream()
                .map(this::mapToPayrollDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PayrollDto updatePayroll(Integer periodId, Integer payrollId, com.karaoke.backend.dto.PayrollUpdateRequestDto requestDto) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll not found"));

        if (!payroll.getPayrollPeriod().getId().equals(periodId)) {
            throw new IllegalArgumentException("Payroll does not belong to the specified period");
        }

        if (payroll.getPayrollPeriod().getStatus() != PayrollPeriod.PayrollPeriodStatus.DRAFT) {
            throw new PayrollPeriodAlreadyApprovedException("Can only update payroll in DRAFT period");
        }

        if (requestDto.baseSalary() != null) {
            payroll.setBaseSalary(requestDto.baseSalary());
        }
        if (requestDto.salaryFromHours() != null) {
            payroll.setSalaryFromHours(requestDto.salaryFromHours());
        }
        if (requestDto.totalBonus() != null) {
            payroll.setTotalBonus(requestDto.totalBonus());
        }
        if (requestDto.totalPenalty() != null) {
            payroll.setTotalPenalty(requestDto.totalPenalty());
        }

        BigDecimal newTotal = payroll.getBaseSalary()
                .add(payroll.getSalaryFromHours() != null ? payroll.getSalaryFromHours() : BigDecimal.ZERO)
                .add(payroll.getTotalBonus() != null ? payroll.getTotalBonus() : BigDecimal.ZERO)
                .subtract(payroll.getTotalPenalty() != null ? payroll.getTotalPenalty() : BigDecimal.ZERO);

        payroll.setTotalSalary(newTotal);

        payrollRepository.save(payroll);

        return mapToPayrollDto(payroll);
    }

    private BigDecimal calculateDurationInHours(LocalDateTime checkin, LocalDateTime checkout) {
        if (checkin == null || checkout == null) return BigDecimal.ZERO;
        long seconds = ChronoUnit.SECONDS.between(checkin, checkout);
        return BigDecimal.valueOf(seconds).divide(BigDecimal.valueOf(3600), 2, java.math.RoundingMode.HALF_UP);
    }

    private PayrollDto mapToPayrollDto(Payroll p) {
        String role = p.getEmployee().getAccount() != null ? p.getEmployee().getAccount().getRole().name() : "STAFF";
        return new PayrollDto(
                p.getId(), p.getPayrollPeriod().getId(), p.getPayrollPeriod().getName(),
                p.getPayrollPeriod().getPeriodStart(), p.getPayrollPeriod().getPeriodEnd(),
                p.getEmployee().getId(), p.getEmployee().getName(), role,
                p.getTotalWorkHours(), p.getBaseSalary(), p.getSalaryFromHours(),
                p.getTotalBonus(), p.getTotalPenalty(), p.getTotalSalary(), p.getStatus().name()
        );
    }

    private PenaltyResponseDto mapToPenaltyDto(Penalty p) {
        return new PenaltyResponseDto(
                p.getId(), p.getType().name(), p.getAmount(), p.getReason(),
                p.getBooking() != null ? p.getBooking().getId() : null, p.getCreatedAt()
        );
    }

    private BonusResponseDto mapToBonusDto(Bonus b) {
        return new BonusResponseDto(
                b.getId(), b.getType().name(), b.getAmount(), b.getNote(), b.getCreatedAt()
        );
    }
}
