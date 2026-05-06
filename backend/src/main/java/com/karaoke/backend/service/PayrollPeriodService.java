package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.EmployeePayrollDetailDto;
import com.karaoke.backend.dto.response.PayrollDto;
import com.karaoke.backend.dto.request.PayrollPeriodRequestDto;
import com.karaoke.backend.dto.request.PayrollUpdateRequestDto;
import com.karaoke.backend.entity.PayrollPeriod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PayrollPeriodService {
    PayrollPeriod createPeriod(PayrollPeriodRequestDto requestDto);
    PayrollPeriod getPeriodById(Integer periodId);
    PayrollPeriod updatePeriodStatus(Integer periodId, PayrollPeriod.PayrollPeriodStatus status);
    void deletePeriod(Integer periodId);
    Page<PayrollDto> getPayrollsByPeriod(Integer periodId, Pageable pageable);
    List<PayrollDto> getAllPayrollsByPeriodForExport(Integer periodId);
    Page<PayrollDto> getMyPayrolls(Integer employeeId, Pageable pageable);
    EmployeePayrollDetailDto getEmployeePayrollDetails(Integer periodId, Integer employeeId);
    Page<PayrollPeriod> getAllPeriods(Pageable pageable);
    PayrollDto updatePayroll(Integer periodId, Integer payrollId, PayrollUpdateRequestDto requestDto);
}
