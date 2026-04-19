package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer>
{
    boolean existsByInvoiceId(Integer invoiceId);
}
