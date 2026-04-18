package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer>
{
    boolean existsByBookingId(Integer bookingId);
}
