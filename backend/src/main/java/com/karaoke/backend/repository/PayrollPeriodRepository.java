package com.karaoke.backend.repository;

import com.karaoke.backend.entity.PayrollPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayrollPeriodRepository extends JpaRepository<PayrollPeriod, Integer> {
    @Query("SELECT COUNT(p) > 0 FROM PayrollPeriod p WHERE p.periodStart <= :date AND p.periodEnd >= :date AND p.status IN (:statuses)")
    boolean isDateLocked(@Param("date") LocalDate date, @Param("statuses") List<PayrollPeriod.PayrollPeriodStatus> statuses);
}
