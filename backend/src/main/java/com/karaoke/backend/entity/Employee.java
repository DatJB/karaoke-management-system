package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "employee")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String phone;

    @Column(name = "base_salary", precision = 12, scale = 2)
    private BigDecimal baseSalary = BigDecimal.ZERO;

    @Column(name = "salary_per_hour", nullable = false, precision = 12, scale = 2)
    private BigDecimal salaryPerHour;

    @Enumerated(EnumType.STRING)
    private EmployeeStatus status = EmployeeStatus.AVAILABLE;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @OneToOne(mappedBy = "employee")
    @JsonIgnore
    private Account account;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<EmployeeShift> shifts;

    @OneToMany(mappedBy = "employee")
    @JsonIgnore
    private List<BookingRoomEmployee> bookingRoomEmployees;

    @OneToMany(mappedBy = "employee")
    @JsonIgnore
    private List<Bonus> bonuses;

    @OneToMany(mappedBy = "employee")
    @JsonIgnore
    private List<Penalty> penalties;

    @OneToMany(mappedBy = "employee")
    @JsonIgnore
    private List<Payroll> payrolls;

    public enum EmployeeStatus {
        AVAILABLE, BUSY, OFF
    }
}
