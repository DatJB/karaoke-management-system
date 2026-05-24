package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String action;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(length = 10)
    private String method;

    private Integer status;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 255)
    private String url;

    @Column(length = 100)
    private String username;
}
