package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Integer> {

    @Query("SELECT p.employee.id, SUM(p.amount) " +
           "FROM Penalty p " +
           "WHERE p.createdAt >= :start AND p.createdAt <= :end " +
           "GROUP BY p.employee.id")
    List<Object[]> aggregatePenalties(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    org.springframework.data.domain.Page<Penalty> findByEmployeeId(Integer employeeId, org.springframework.data.domain.Pageable pageable);
    List<Penalty> findByEmployeeIdAndCreatedAtBetween(Integer employeeId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT e.name, a.type, COUNT(a.id) " +
            "FROM Penalty a JOIN a.employee e " +
            "WHERE a.createdAt BETWEEN :start AND :end AND a.type IN ('LATE', 'ABSENT') " +
            "GROUP BY e.id, e.name, a.type " +
            "ORDER BY COUNT(a.id) DESC")
    List<Object[]> findAttendanceIssues(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT e.name, p.type, COUNT(p.id) " +
            "FROM Penalty p JOIN p.employee e " +
            "WHERE p.createdAt BETWEEN :start AND :end " +
            "AND p.type IN ('MISCONDUCT', 'BOOKING', 'GENERAL') " +
            "GROUP BY e.id, e.name, p.type " +
            "ORDER BY COUNT(p.id) DESC")
    List<Object[]> findOperationalPenalties(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
