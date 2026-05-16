package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.response.RevenueResponse;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticServiceImpl implements StatisticService
{
    private final InvoiceRepository invoiceRepository;

    @Override
    public RevenueResponse getRevenueStats(int year)
    {
        List<Object[]> results = invoiceRepository.getMonthlyRevenue(year);
        List<RevenueResponse.MonthlyRevenue> monthlyData = new ArrayList<>();
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalBookings = 0;

        for (Object[] result : results)
        {
            int month = (int) result[0];
            BigDecimal revenue = (BigDecimal) result[1];
            long count = (long) result[2];

            monthlyData.add(RevenueResponse.MonthlyRevenue.builder()
                    .month(month)
                    .revenue(revenue)
                    .bookingCount(count)
                    .build());
            
            totalRevenue = totalRevenue.add(revenue);
            totalBookings += count;
        }

        long totalCustomers = invoiceRepository.countCustomersByYear(year);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(totalBookings)
                .totalCustomers(totalCustomers)
                .monthlyData(monthlyData)
                .build();
    }
}
