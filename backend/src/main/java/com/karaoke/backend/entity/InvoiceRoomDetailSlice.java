package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoice_room_detail_slice")
@Data
public class InvoiceRoomDetailSlice
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_room_detail_id")
    private InvoiceRoomDetail invoiceRoomDetail;

    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal pricePerHour;
    private BigDecimal hoursUsed;
    private BigDecimal totalAmount;
}