package com.karaoke.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 20)
    private String code;

    @Column(length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    private ProductCategory category = ProductCategory.OTHER;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    private Integer stock = 0;

    @OneToMany(mappedBy = "product")
    private List<InvoiceItem> invoiceItems;

    public enum ProductCategory {
        FOOD, DRINK, EQUIPMENT, OTHER
    }
}
