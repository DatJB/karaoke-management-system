package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Bonus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BonusRepository extends JpaRepository<Bonus, Integer> {

    @Query("SELECT b.employee.id, SUM(b.amount) " +
           "FROM Bonus b " +
           "WHERE b.createdAt >= :start AND b.createdAt <= :end " +
           "GROUP BY b.employee.id")
    List<Object[]> aggregateBonuses(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    org.springframework.data.domain.Page<Bonus> findByEmployeeId(Integer employeeId, org.springframework.data.domain.Pageable pageable);
    List<Bonus> findByEmployeeIdAndCreatedAtBetween(Integer employeeId, LocalDateTime start, LocalDateTime end);
}
