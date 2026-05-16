package com.karaoke.backend.repository;

import com.karaoke.backend.entity.WeeklyInsightReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WeeklyInsightReportRepository extends JpaRepository<WeeklyInsightReport, Integer>
{
    Optional<WeeklyInsightReport> findByWeekNumberAndReportYear(Integer weekNumber, Integer reportYear);

    Optional<WeeklyInsightReport> findFirstByOrderByReportYearDescWeekNumberDesc();
}
