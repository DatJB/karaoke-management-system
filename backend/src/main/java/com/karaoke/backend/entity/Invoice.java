package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "invoice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", unique = true, nullable = false)
    private Booking booking;

    @Column(name = "room_price", precision = 12, scale = 2)
    private BigDecimal roomPrice = BigDecimal.ZERO;

    @Column(name = "service_price", precision = 12, scale = 2)
    private BigDecimal servicePrice = BigDecimal.ZERO;

    @Column(name = "discount_percent", precision = 12, scale = 2)
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.UNPAID;

    @Column(name = "hash_value")
    private String hashValue;

    @Column(name = "encrypted_amount", length = 1000)
    private String encryptedAmount;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null)
            createdAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceRoomDetail> roomDetails;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items;

    @OneToOne(mappedBy = "invoice", cascade = CascadeType.ALL)
    private Feedback feedback;

    @OneToMany(mappedBy = "invoice")
    private List<Bonus> bonuses;

    @OneToMany(mappedBy = "invoice")
    private List<Penalty> penalties;

    public enum InvoiceStatus {
        UNPAID, PAID
    }
}
