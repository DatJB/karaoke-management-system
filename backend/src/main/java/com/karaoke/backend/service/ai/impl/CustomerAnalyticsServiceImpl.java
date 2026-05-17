package com.karaoke.backend.service.ai.impl;

import com.karaoke.backend.repository.CustomerRepository;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.service.ai.CustomerAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerAnalyticsServiceImpl implements CustomerAnalyticsService
{
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    @Override
    public String getTopSpenders(LocalDateTime start, LocalDateTime end)
    {
        List<Object[]> results = invoiceRepository.findTopSpenders(start, end, PageRequest.of(0, 5));

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> String.format("- Khách hàng %s (SĐT: %s): Tổng chi tiêu %s VNĐ",
                        row[0], row[1], row[2].toString()))
                .collect(Collectors.joining("\n"));
    }

    @Override
    public String getMostFrequentCustomers(LocalDateTime start, LocalDateTime end)
    {
        List<Object[]> results = invoiceRepository.findMostFrequentCustomers(start, end, PageRequest.of(0, 5));

        if (results.isEmpty()) return null;

        return results.stream()
                .map(row -> String.format("- Khách hàng %s (SĐT: %s): Đã đến %d lần",
                        row[0], row[1], (Long) row[2]))
                .collect(Collectors.joining("\n"));
    }

    @Override
    public String getSleepingCustomers(LocalDateTime cutoffDate)
    {
        List<Object[]> results = customerRepository.findSleepingCustomers(cutoffDate, PageRequest.of(0, 10));

        if (results.isEmpty()) return null;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        return results.stream()
                .map(row -> {
                    LocalDateTime lastVisit = (LocalDateTime) row[2];
                    return String.format("- Khách hàng %s (SĐT: %s): Lần cuối đến quán là %s",
                            row[0], row[1], lastVisit.format(formatter));
                })
                .collect(Collectors.joining("\n"));
    }
}
