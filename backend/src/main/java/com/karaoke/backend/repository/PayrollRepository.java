package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Integer> {

    void deleteByPayrollPeriodIdAndStatus(Integer payrollPeriodId, Payroll.PayrollStatus status);

    Page<Payroll> findByPayrollPeriodId(Integer periodId, Pageable pageable);
    Optional<Payroll> findByPayrollPeriodIdAndEmployeeId(Integer periodId, Integer employeeId);
    Page<Payroll> findByEmployeeId(Integer employeeId, Pageable pageable);

    @Modifying
    @Query("UPDATE Payroll p SET p.status = :newStatus WHERE p.payrollPeriod.id = :periodId")
    void bulkUpdateStatusByPeriodId(@Param("periodId") Integer periodId,
                                    @Param("newStatus") Payroll.PayrollStatus newStatus);

    @Query("SELECT SUM(p.totalSalary) FROM Payroll p WHERE p.createdAt BETWEEN :start AND :end")
    BigDecimal calculateTotalPayroll(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
