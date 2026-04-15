package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer size;

    @Enumerated(EnumType.STRING)
    private RoomCategory category = RoomCategory.STANDARD;

    @Enumerated(EnumType.STRING)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomPrice> prices;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomPriceSpecial> specialPrices;

    @OneToMany(mappedBy = "room")
    private List<BookingRoom> bookingRooms;

    public enum RoomCategory {
        STANDARD, VIP
    }

    public enum RoomStatus {
        AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
    }
}
