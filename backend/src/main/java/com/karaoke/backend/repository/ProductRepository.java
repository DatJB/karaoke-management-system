package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer>
{
    @Query("SELECT p FROM Product p " +
            "WHERE (:keyword IS NULL OR :keyword = '' " +
            "       OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "       OR LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:category IS NULL OR p.category = :category)")
    Page<Product> searchAndFilterProducts(
            @Param("keyword") String keyword,
            @Param("category") Product.ProductCategory category,
            Pageable pageable
    );

    Optional<Product> findByCode(String code);
}
