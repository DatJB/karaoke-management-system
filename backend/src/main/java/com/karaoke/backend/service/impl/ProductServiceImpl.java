package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.ProductRequest;
import com.karaoke.backend.dto.response.ProductResponse;
import com.karaoke.backend.entity.Product;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.ProductRepository;
import com.karaoke.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Product code already exists: " + request.getCode());
        }

        Product product = Product.builder()
                .code(request.getCode())
                .name(request.getName())
                .category(request.getCategory())
                .price(request.getPrice())
                .stock(request.getStock())
                .build();

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Integer id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getCode().equals(request.getCode()) && productRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Product code already exists: " + request.getCode());
        }

        product.setCode(request.getCode());
        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.getInvoiceItems() != null && !product.getInvoiceItems().isEmpty()) {
            throw new IllegalStateException("Cannot delete product as it is linked to existing invoices.");
        }

        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .category(product.getCategory())
                .price(product.getPrice())
                .stock(product.getStock())
                .build();
    }
}
