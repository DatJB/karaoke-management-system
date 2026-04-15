package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Integer id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "employee_id", nullable = false)
        private Employee employee;

        @Column(name = "period_start", nullable = false)
        private LocalDate periodStart;

        @Column(name = "period_end", nullable = false)
        private LocalDate periodEnd;

        @Column(name = "total_work_hours", precision = 10, scale = 2)
        private BigDecimal totalWorkHours = BigDecimal.ZERO;

        @Column(name = "base_salary", precision = 12, scale = 2)
        private BigDecimal baseSalary = BigDecimal.ZERO;

        @Column(name = "salary_from_hours", precision = 12, scale = 2)
        private BigDecimal salaryFromHours = BigDecimal.ZERO;

        @Column(name = "total_penalty", precision = 12, scale = 2)
        private BigDecimal totalPenalty = BigDecimal.ZERO;

        @Column(name = "total_bonus", precision = 12, scale = 2)
        private BigDecimal totalBonus = BigDecimal.ZERO;

        @Column(name = "total_salary", precision = 12, scale = 2)
        private BigDecimal totalSalary = BigDecimal.ZERO;

        @Enumerated(EnumType.STRING)
        private PayrollStatus status = PayrollStatus.DRAFT;

        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;

        @PrePersist
        protected void onCreate() {
                if (createdAt == null)
                        createdAt = LocalDateTime.now();
        }

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "payroll_period_id", nullable = false)
        private PayrollPeriod payrollPeriod;

        public enum PayrollStatus {
                DRAFT, APPROVED, PAID
        }
}
