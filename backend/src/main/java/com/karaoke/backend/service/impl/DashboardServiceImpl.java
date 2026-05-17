package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.response.DashboardResponse;
import com.karaoke.backend.entity.Invoice;
import com.karaoke.backend.entity.Room;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.CustomerRepository;
import com.karaoke.backend.repository.FeedbackRepository;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final FeedbackRepository feedbackRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStats()
    {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();;

        BigDecimal todayRevenue = invoiceRepository.sumTodayRevenue();
        long todayBookings = bookingRepository.countByCreatedAtAfter(startOfDay);
        long activeRooms = roomRepository.countByStatus(Room.RoomStatus.OCCUPIED);
        long todayCustomers = customerRepository.countByCreatedAtAfter(startOfDay);

//        List<DashboardResponse.WeeklyRevenue> weeklyData = invoiceRepository.getWeeklyRevenue(startOfWeek);

        List<DashboardResponse.RecentActivity> activities = new ArrayList<>();

        List<Object[]> rawWeeklyData = invoiceRepository.getWeeklyRevenueRawData(startOfWeek);

        List<DashboardResponse.WeeklyRevenue> weeklyData = rawWeeklyData.stream()
                .map(row -> DashboardResponse.WeeklyRevenue.builder()
                        .dayOfWeek((String) row[0])
                        .revenue(BigDecimal.valueOf(row[1] != null ? ((BigDecimal) row[1]).doubleValue() : 0D)) // Cột 2 là Tổng tiền
                        .build())
                .collect(Collectors.toList());

        activities.addAll(bookingRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(b -> DashboardResponse.RecentActivity.builder()
                        .description("Khách " + (b.getCustomer() != null ? b.getCustomer().getName() : "Vãng lai") +
                                ": " + getBookingStatus(b.getStatus()))
                        .timestamp(b.getCreatedAt())
                        .type(DashboardResponse.Activity.BOOKING)
                        .build())
                .collect(Collectors.toList()));

        activities.addAll(invoiceRepository.findTop5ByStatusOrderByPaidAtDesc(Invoice.InvoiceStatus.PAID)
                .stream()
                .map(i -> DashboardResponse.RecentActivity.builder()
                        .description("Khách " + (i.getBooking().getCustomer() != null ? i.getBooking().getCustomer().getName() : "Vãng lai") +
                                " đã thanh toán hóa đơn " + String.format("%,.0f", i.getTotalPrice()) + "đ")
                        .timestamp(i.getPaidAt())
                        .type(DashboardResponse.Activity.PAYMENT)
                        .build())
                .collect(Collectors.toList()));

        activities.addAll(feedbackRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(f -> DashboardResponse.RecentActivity.builder()
                        .description("Khách hàng đã gửi đánh giá " + f.getRating() + " sao")
                        .timestamp(f.getCreatedAt())
                        .type(DashboardResponse.Activity.FEEDBACK)
                        .build())
                .collect(Collectors.toList()));

        List<DashboardResponse.RecentActivity> sortedActivities = activities.stream()
                .sorted(Comparator.comparing(DashboardResponse.RecentActivity::getTimestamp).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // Tính toán so sánh với ngày hôm qua
        LocalDateTime startOfYesterday = startOfDay.minusDays(1);
        LocalDateTime endOfYesterday = LocalDateTime.now().minusDays(1);

        BigDecimal yesterdayRevenue = invoiceRepository.sumRevenueBetween(startOfYesterday, endOfYesterday);
        if (yesterdayRevenue == null) yesterdayRevenue = BigDecimal.ZERO;
        long yesterdayBookings = bookingRepository.countByCreatedAtBetween(startOfYesterday, endOfYesterday);
        long yesterdayCustomers = customerRepository.countByCreatedAtBetween(startOfYesterday, endOfYesterday);

        double revenueChange = calculatePercentageChange(yesterdayRevenue, todayRevenue != null ? todayRevenue : BigDecimal.ZERO);
        double bookingsChange = calculatePercentageChange(BigDecimal.valueOf(yesterdayBookings), BigDecimal.valueOf(todayBookings));
        double customersChange = calculatePercentageChange(BigDecimal.valueOf(yesterdayCustomers), BigDecimal.valueOf(todayCustomers));

        return DashboardResponse.builder()
                .todayTotalRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .todayTotalBookings(todayBookings)
                .activeRooms(activeRooms)
                .todayTotalCustomers(todayCustomers)
                .revenueChange(revenueChange)
                .bookingsChange(bookingsChange)
                .customersChange(customersChange)
                .thisWeekRevenue(weeklyData)
                .recentActivities(sortedActivities)
                .build();
    }

    private double calculatePercentageChange(BigDecimal previous, BigDecimal current) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private String getBookingStatus(com.karaoke.backend.entity.Booking.BookingStatus status) {
        if (status == null) return "N/A";
        switch (status) {
            case BOOKED: return "Đã đặt chỗ";
            case CHECKED_IN: return "Đã nhận phòng";
            case CHECKED_OUT: return "Đã trả phòng";
            case CANCELLED: return "Đã hủy";
            default: return status.toString();
        }
    }

}
