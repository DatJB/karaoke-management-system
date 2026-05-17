package com.karaoke.backend.service.ai.impl;

import com.karaoke.backend.dto.response.RevenueBreakdownDto;
import com.karaoke.backend.dto.response.RevenueResponse;
import com.karaoke.backend.repository.InvoiceItemRepository;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.service.ai.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RevenueServiceImpl implements RevenueService
{
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;

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

    @Override
    public BigDecimal getRevenueByMonth(int month)
    {
        int currentYear = LocalDate.now().getYear();

        LocalDateTime start = LocalDateTime.of(currentYear, month, 1, 0, 0);
        LocalDateTime end = YearMonth.of(currentYear, month).atEndOfMonth().atTime(23, 59, 59);

        BigDecimal revenue = invoiceRepository.calculateTotalRevenue(start, end);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    @Override
    public String getPeakHoursInPeriod(LocalDateTime start, LocalDateTime end)
    {
        List<Object[]> results = invoiceRepository.findPeakHours(start, end);

        if (results.isEmpty())
        {
            return null;
        }

        Object[] topHourData = results.get(0);
        int peakHour = (int) topHourData[0];
        long bookingCount = (long) topHourData[1];

        return String.format("%dh00 - %dh00 (với %d lượt khách/hóa đơn)", peakHour, peakHour + 1, bookingCount);
    }

    @Override
    public RevenueBreakdownDto getRevenueBreakdown(LocalDateTime start, LocalDateTime end)
    {
        BigDecimal roomRev = invoiceRepository.calculateRoomRevenue(start, end);
        BigDecimal serviceRev = invoiceRepository.calculateServiceRevenue(start, end);

        roomRev = roomRev != null ? roomRev : BigDecimal.ZERO;
        serviceRev = serviceRev != null ? serviceRev : BigDecimal.ZERO;
        BigDecimal total = roomRev.add(serviceRev);

        return new RevenueBreakdownDto(roomRev, serviceRev, total);
    }

    @Override
    public List<String> getTopSellingItems(LocalDateTime start, LocalDateTime end, int limit)
    {
        PageRequest pageable = PageRequest.of(0, limit);
        return invoiceItemRepository.findTopSellingItemsAsStrings(start, end, pageable);
    }
}
