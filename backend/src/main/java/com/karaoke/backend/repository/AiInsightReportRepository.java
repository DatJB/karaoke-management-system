package com.karaoke.backend.repository;

import com.karaoke.backend.entity.AiInsightReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AiInsightReportRepository extends JpaRepository<AiInsightReport, Integer>
{
    List<AiInsightReport> findByReportDateBetweenOrderByCreatedAtDesc(LocalDate startDate, LocalDate endDate);
}
