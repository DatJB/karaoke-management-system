package com.karaoke.backend.dto.request;

import lombok.Data;

@Data
public class OrderRequest {
    private Integer productId;
    private Integer quantity;
}
