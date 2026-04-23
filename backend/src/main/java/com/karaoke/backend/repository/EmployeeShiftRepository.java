package com.karaoke.backend.repository;

import com.karaoke.backend.entity.EmployeeShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmployeeShiftRepository extends JpaRepository<EmployeeShift, Integer>
{
    boolean existsByEmployeeIdAndShiftIdAndWorkDate(Integer employeeId, Integer shiftId, LocalDate workDate);

    Optional<EmployeeShift> findByEmployeeIdAndShiftIdAndWorkDate(Integer employeeId, Integer shiftId, LocalDate workDate);

    @Query("""
            select es from EmployeeShift es
            join fetch es.employee e
            join fetch es.shift s
            where (:fromDate is null or es.workDate >= :fromDate)
              and (:toDate is null or es.workDate <= :toDate)
            order by es.workDate asc, s.startTime asc, e.name asc
            """)
    List<EmployeeShift> findSchedules(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("""
            select es from EmployeeShift es
            join fetch es.employee e
            join fetch es.shift s
            where e.id = :employeeId
              and (:fromDate is null or es.workDate >= :fromDate)
              and (:toDate is null or es.workDate <= :toDate)
            order by es.workDate asc, s.startTime asc
            """)
    List<EmployeeShift> findSchedulesByEmployee(
            @Param("employeeId") Integer employeeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}
