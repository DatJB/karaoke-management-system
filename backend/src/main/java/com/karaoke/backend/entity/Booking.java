package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "booking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.BOOKED;

    @Column(length = 255)
    private String note;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingRoom> bookingRooms;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Invoice invoice;

    @OneToMany(mappedBy = "booking")
    private List<Bonus> bonuses;

    @OneToMany(mappedBy = "booking")
    private List<Penalty> penalties;

    public enum BookingStatus {
        BOOKED, CHECKED_IN, CHECKED_OUT, CANCELLED
    }
}
