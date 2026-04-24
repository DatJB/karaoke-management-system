package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.PayrollCalculationResultDto;
import com.karaoke.backend.entity.*;
import com.karaoke.backend.exception.PayrollPeriodAlreadyApprovedException;
import com.karaoke.backend.repository.*;
import com.karaoke.backend.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final PayrollPeriodRepository payrollPeriodRepository;
    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final BonusRepository bonusRepository;
    private final PenaltyRepository penaltyRepository;
    private final BookingRoomEmployeeRepository bookingRoomEmployeeRepository;

    @Override
    @Transactional
    public PayrollCalculationResultDto calculatePayroll(Integer periodId) {
        final PayrollPeriod period = payrollPeriodRepository.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Payroll Period not found with id: " + periodId));

        if (period.getStatus() != PayrollPeriod.PayrollPeriodStatus.DRAFT) {
            throw new PayrollPeriodAlreadyApprovedException("Cannot recalculate. Period is already " + period.getStatus());
        }

        payrollRepository.deleteByPayrollPeriodIdAndStatus(periodId, Payroll.PayrollStatus.DRAFT);

        final LocalDateTime startOfDay = period.getPeriodStart().atStartOfDay();
        final LocalDateTime endOfDay = period.getPeriodEnd().atTime(LocalTime.MAX);

        final Map<Integer, BigDecimal> hoursMap = buildMap(bookingRoomEmployeeRepository.aggregateServiceHours(startOfDay, endOfDay));
        final Map<Integer, BigDecimal> bonusesMap = buildMap(bonusRepository.aggregateBonuses(startOfDay, endOfDay));
        final Map<Integer, BigDecimal> penaltiesMap = buildMap(penaltyRepository.aggregatePenalties(startOfDay, endOfDay));

        final List<Employee> employees = employeeRepository.findAllWithAccount();

        final List<Payroll> payrolls = employees.stream()
                .map(emp -> processEmployeePayroll(emp, period, hoursMap, bonusesMap, penaltiesMap))
                .collect(Collectors.toList());

        payrollRepository.saveAll(payrolls);

        final BigDecimal totalAmount = payrolls.stream()
                .map(Payroll::getTotalSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PayrollCalculationResultDto("Calculation successful", payrolls.size(), totalAmount);
    }

    private Payroll processEmployeePayroll(Employee employee, PayrollPeriod period,
                                           Map<Integer, BigDecimal> hoursMap,
                                           Map<Integer, BigDecimal> bonusesMap,
                                           Map<Integer, BigDecimal> penaltiesMap) {

        final Account.Role role = determineRole(employee);
        final BigDecimal baseSalary = employee.getBaseSalary() != null ? employee.getBaseSalary() : BigDecimal.ZERO;
        final BigDecimal bonuses = bonusesMap.getOrDefault(employee.getId(), BigDecimal.ZERO);
        final BigDecimal penalties = penaltiesMap.getOrDefault(employee.getId(), BigDecimal.ZERO);

        BigDecimal hours = BigDecimal.ZERO;
        BigDecimal salaryFromHours = BigDecimal.ZERO;

        if (role == Account.Role.STAFF) {
            hours = hoursMap.getOrDefault(employee.getId(), BigDecimal.ZERO);
            final BigDecimal hourlyRate = employee.getSalaryPerHour() != null ? employee.getSalaryPerHour() : BigDecimal.ZERO;
            salaryFromHours = hours.multiply(hourlyRate);
        }

        final BigDecimal totalSalary = baseSalary.add(salaryFromHours).add(bonuses).subtract(penalties);

        return Payroll.builder()
                .employee(employee)
                .payrollPeriod(period)
                .periodStart(period.getPeriodStart())
                .periodEnd(period.getPeriodEnd())
                .totalWorkHours(hours)
                .baseSalary(baseSalary)
                .salaryFromHours(salaryFromHours)
                .totalBonus(bonuses)
                .totalPenalty(penalties)
                .totalSalary(totalSalary)
                .status(Payroll.PayrollStatus.DRAFT)
                .build();
    }

    private Account.Role determineRole(Employee employee) {
        if (employee.getAccount() != null && employee.getAccount().getRole() != null) {
            return employee.getAccount().getRole();
        }
        return Account.Role.STAFF; // Default to STAFF if no account is found
    }

    private Map<Integer, BigDecimal> buildMap(List<Object[]> results) {
        return results.stream()
                .filter(row -> row[0] != null && row[1] != null)
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> new BigDecimal(row[1].toString())
                ));
    }
}
