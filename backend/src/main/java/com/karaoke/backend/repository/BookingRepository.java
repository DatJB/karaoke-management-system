package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer>
{
    boolean existsByCustomerId(Integer customerId);
}
