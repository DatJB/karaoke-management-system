package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "booking_room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Enumerated(EnumType.STRING)
    private BookingRoomStatus status = BookingRoomStatus.PLAYING;

    @Column(name = "checkin_time")
    private LocalDateTime checkinTime;

    @Column(name = "checkout_time")
    private LocalDateTime checkoutTime;

    @OneToMany(mappedBy = "bookingRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingRoomEmployee> employees;

    @OneToMany(mappedBy = "bookingRoom")
    private List<InvoiceRoomDetail> invoiceRoomDetails;

    @OneToMany(mappedBy = "bookingRoom")
    private List<InvoiceItem> invoiceItems;

    public enum BookingRoomStatus {
        PLAYING, DONE, CANCELLED
    }
}
