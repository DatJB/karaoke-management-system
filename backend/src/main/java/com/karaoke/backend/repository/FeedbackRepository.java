package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Feedback;
import com.karaoke.backend.entity.FeedbackTag;
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

    Page<Feedback> findBySentimentLabelAndCreatedAtBetween(Feedback.SentimentLabel sentiment, LocalDateTime start, LocalDateTime end, Pageable pageable);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countBySentimentLabelAndCreatedAtBetween(Feedback.SentimentLabel sentiment, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(AVG(f.rating), 0.0) FROM Feedback f WHERE f.createdAt >= :start AND f.createdAt <= :end")
    Double getAverageRating(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<Feedback> findTop5BySentimentLabelOrderByCreatedAtDesc(Feedback.SentimentLabel sentimentLabel);

    int countBySentimentLabel(Feedback.SentimentLabel sentimentLabel);

    List<Feedback> findTop10ByCreatedAtBetweenAndSentimentLabelOrderByCreatedAtDesc(LocalDateTime startDateTime, LocalDateTime endDateTime, Feedback.SentimentLabel enumLabel);

    List<Feedback> findTop10ByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDateTime, LocalDateTime endDateTime);

    List<Feedback> findAllByCreatedAtBetweenAndSentimentLabel(LocalDateTime startDateTime, LocalDateTime endDateTime, Feedback.SentimentLabel enumLabel);

    List<Feedback> findAllByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    @Query("SELECT r.room.name, AVG(f.rating), COUNT(f.id) " +
            "FROM Feedback f " +
            "JOIN f.extractedTags e " +
            "JOIN f.invoice i " +
            "JOIN i.roomDetails ro " +
            "JOIN ro.bookingRoom r " +
            "WHERE f.createdAt BETWEEN :start AND :end " +
            "AND e.tagName = :tagType " +
            "GROUP BY r.room.name " +
            "ORDER BY AVG(f.rating) ASC")
    List<Object[]> findRoomAverageRatingAsc(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("tagType") FeedbackTag.SystemTag tagType,
            org.springframework.data.domain.Pageable pageable
    );

    @Query("SELECT r.room.name, AVG(f.rating), COUNT(f.id) " +
            "FROM Feedback f " +
            "JOIN f.invoice i " +
            "JOIN i.roomDetails ro " +
            "JOIN ro.bookingRoom r " +
            "JOIN f.extractedTags e " +
            "WHERE f.createdAt BETWEEN :start AND :end " +
            "AND e.tagName = :tagType " +
            "GROUP BY r.room.name " +
            "ORDER BY AVG(f.rating) DESC")
    List<Object[]> findRoomAverageRatingDesc(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("tagType") FeedbackTag.SystemTag tagType,
            org.springframework.data.domain.Pageable pageable
    );

    @Query("SELECT e.employee.name, f.comment, f.rating " +
            "FROM Feedback f " +
            "JOIN f.extractedTags t " +
            "JOIN f.invoice i " +
            "JOIN i.booking bk " +
            "JOIN bk.bookingRooms br " +
            "JOIN br.employees e " +
            "WHERE f.createdAt BETWEEN :start AND :end " +
            "AND f.sentimentLabel = 'NEGATIVE' " +
            "AND t.tagName = :tagType")
    List<Object[]> findEmployeeNegativeFeedbacks(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("tagType") FeedbackTag.SystemTag tagType
    );
}
