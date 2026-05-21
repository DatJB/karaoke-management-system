package com.karaoke.backend.entity;

import com.karaoke.backend.converter.FeedbackTagListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", unique = true, nullable = false)
    private Invoice invoice;

    private Double rating;

    @Lob
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(name = "sentiment_label")
    private SentimentLabel sentimentLabel;

    @Column(name = "sentiment_score", precision = 5, scale = 4)
    private BigDecimal sentimentScore;

//    @Column(name = "extracted_tags", columnDefinition = "JSON")
//    @Convert(converter = FeedbackTagListConverter.class)
//    private List<FeedbackTag> extractedTags;

    @ElementCollection
    @CollectionTable(name = "feedback_tags", joinColumns = @JoinColumn(name = "feedback_id"))
    private List<FeedbackTag> extractedTags;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate()
    {
        if (createdAt == null)
            createdAt = LocalDateTime.now();
    }

    public enum SentimentLabel {
        POSITIVE, NEUTRAL, NEGATIVE
    }
}
