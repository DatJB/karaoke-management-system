package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoice_room_detail")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class InvoiceRoomDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_room_id", nullable = false)
    private BookingRoom bookingRoom;

    @Column(name = "hours_used", precision = 10, scale = 2)
    private BigDecimal hoursUsed;

    @Column(name = "price_per_hour", precision = 12, scale = 2)
    private BigDecimal pricePerHour;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @OneToMany(mappedBy = "invoiceRoomDetail", cascade = CascadeType.ALL)
    private List<InvoiceRoomDetailSlice> slices = new ArrayList<>();
}
