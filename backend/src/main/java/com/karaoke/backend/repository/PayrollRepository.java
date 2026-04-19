package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Integer> {

    void deleteByPayrollPeriodIdAndStatus(Integer payrollPeriodId, Payroll.PayrollStatus status);

    Page<Payroll> findByPayrollPeriodId(Integer periodId, Pageable pageable);
    Optional<Payroll> findByPayrollPeriodIdAndEmployeeId(Integer periodId, Integer employeeId);
    Page<Payroll> findByEmployeeId(Integer employeeId, Pageable pageable);
}
