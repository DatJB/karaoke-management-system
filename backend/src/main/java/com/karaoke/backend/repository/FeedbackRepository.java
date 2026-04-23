package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    List<Feedback> findTop5ByOrderByCreatedAtDesc();

    boolean existsByInvoiceId(Integer invoiceId);

    List<Feedback> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    Page<Feedback> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countBySentimentLabelAndCreatedAtBetween(Feedback.SentimentLabel sentiment, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(AVG(f.rating), 0.0) FROM Feedback f WHERE f.createdAt >= :start AND f.createdAt <= :end")
    Double getAverageRating(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
