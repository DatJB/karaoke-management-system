package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties({"account", "shifts", "bookingRoomEmployees", "bonuses", "penalties", "payrolls"})
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private AccountStatus status = AccountStatus.ACTIVE;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @OneToMany(mappedBy = "account")
    @JsonIgnore
    private List<Notification> notifications;

    @Column(name = "totp_secret_key", length = 64)
    private String totpSecretKey;

    @Column(name = "is_2fa_enabled", nullable = false)
    private Boolean twoFactorEnabled = false;

    public enum Role {
        MANAGER, STAFF, RECEPTIONIST, ADMIN
    }

    public enum AccountStatus {
        ACTIVE, INACTIVE
    }
}
