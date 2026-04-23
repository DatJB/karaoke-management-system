package com.karaoke.backend.dto.response;

import com.karaoke.backend.entity.Product;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProductResponse {
    private Integer id;
    private String code;
    private String name;
    private Product.ProductCategory category;
    private BigDecimal price;
    private Integer stock;
}
