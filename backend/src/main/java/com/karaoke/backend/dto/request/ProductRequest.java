package com.karaoke.backend.dto.request;

import com.karaoke.backend.entity.Product;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    private String code;
    private String name;
    private Product.ProductCategory category;
    private BigDecimal price;
    private Integer stock;
}
