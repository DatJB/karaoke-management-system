package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.ProductRequest;
import com.karaoke.backend.dto.response.NewPageResponse;
import com.karaoke.backend.dto.response.ProductResponse;
import com.karaoke.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    NewPageResponse<ProductResponse> getAllProducts(String keyword, Product.ProductCategory category, Pageable pageable);
    ProductResponse getProductById(Integer id);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Integer id, ProductRequest request);
    void deleteProduct(Integer id);
}
