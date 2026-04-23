package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_insight_report")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiInsightReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(name = "insight_title", length = 255)
    private String insightTitle;

    @Column(name = "insight_content", columnDefinition = "TEXT")
    private String insightContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity_level", columnDefinition = "ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')")
    private SeverityLevel severityLevel;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Category {
        FOOD, DEVICE, SERVICE, GENERAL
    }

    public enum SeverityLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}