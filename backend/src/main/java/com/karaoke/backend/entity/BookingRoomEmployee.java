package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_room_employee")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BookingRoomEmployee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_room_id", nullable = false)
    private BookingRoom bookingRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
}
