package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.FeedbackCreateRequest;
import com.karaoke.backend.entity.Feedback;
import com.karaoke.backend.entity.Invoice;
import com.karaoke.backend.exception.BusinessException;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.FeedbackRepository;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.service.FeedbackService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService
{
    private final FeedbackRepository feedbackRepository;
    private final InvoiceRepository invoiceRepository;
    private final AiIntegrationServiceImpl aiIntegrationService;

    @Override
    @Transactional
    public void submitFeedback(FeedbackCreateRequest request)
    {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn ID: " + request.getInvoiceId()));

        if (!invoice.getStatus().name().equals("PAID"))
        {
            throw new BusinessException("Bạn chỉ có thể gửi đánh giá sau khi đã thanh toán hóa đơn!");
        }

        if (feedbackRepository.existsByInvoiceId(request.getInvoiceId()))
        {
            throw new BusinessException("Hóa đơn này đã được đánh giá. Cảm ơn bạn!");
        }

        Feedback feedback = new Feedback();
        feedback.setInvoice(invoice);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());

        Feedback savedFeedback = feedbackRepository.save(feedback);

        if (request.getComment() != null && !request.getComment().trim().isEmpty())
        {
            aiIntegrationService.analyzeFeedbackAsync(savedFeedback.getId(), request.getComment());
        }
    }
}
