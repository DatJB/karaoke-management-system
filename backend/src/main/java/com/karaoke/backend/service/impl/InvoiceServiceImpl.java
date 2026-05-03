package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.response.*;
import com.karaoke.backend.entity.*;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.InvoiceRepository;
import com.karaoke.backend.repository.RoomPriceRepository;
import com.karaoke.backend.repository.RoomPriceSpecialRepository;
import com.karaoke.backend.service.InvoiceService;
import com.karaoke.backend.service.KaraokePricingEngine;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService
{
    private final InvoiceRepository invoiceRepository;
    private final KaraokePricingEngine pricingEngine;
    private final RoomPriceRepository roomPriceRepository;
    private final RoomPriceSpecialRepository roomPriceSpecialRepository;

    @Override
    @Transactional
    public Page<InvoiceSummaryResponse> getInvoices(String statusStr, String keyword, LocalDate date, int page, int size)
    {
        Invoice.InvoiceStatus statusEnum = null;
        if (statusStr != null && !statusStr.trim().isEmpty())
        {
            try
            {
                statusEnum = Invoice.InvoiceStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {}
        }

        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;

        if (date != null)
        {
            startDateTime = date.atStartOfDay();
            endDateTime = date.atTime(23, 59, 59, 999999);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Invoice> invoicePage = invoiceRepository.searchInvoices(
                statusEnum, keyword, startDateTime, endDateTime, pageable);

        return invoicePage.map(invoice -> {
            InvoiceSummaryResponse dto = new InvoiceSummaryResponse();
            dto.setInvoiceId(invoice.getId());
            dto.setBookingId(invoice.getBooking().getId());
            dto.setStatus(invoice.getStatus().name());
            dto.setCreatedAt(invoice.getCreatedAt());

            if (invoice.getBooking().getCustomer() != null) {
                dto.setCustomerName(invoice.getBooking().getCustomer().getName());
                dto.setCustomerPhone(invoice.getBooking().getCustomer().getPhone());
                dto.setCustomerIdentity(invoice.getBooking().getCustomer().getIdentity());
            }

            String roomNames = invoice.getBooking().getBookingRooms().stream()
                    .filter(br -> !br.getStatus().name().equals("CANCELLED"))
                    .map(br -> br.getRoom().getName())
                    .reduce((a, b) -> a + ", " + b).orElse("");
            dto.setRoomNames(roomNames);

            return dto;
        });
    }

    @Override
    @Transactional
    public InvoiceDetailResponse getInvoiceDetail(Integer id)
    {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn ID: " + id));

        InvoiceDetailResponse response = new InvoiceDetailResponse();
        response.setInvoiceId(invoice.getId());
        response.setBookingId(invoice.getBooking().getId());
        response.setStatus(invoice.getStatus().name());
        response.setCreatedAt(invoice.getCreatedAt());
        response.setTotalRoomPrice(invoice.getRoomPrice());
        response.setTotalServicePrice(invoice.getServicePrice());
        response.setDiscount(invoice.getDiscount());
        response.setTotalPrice(invoice.getTotalPrice());

        Customer customer = invoice.getBooking().getCustomer();
        if (customer != null) {
            response.setCustomerName(customer.getName());
            response.setCustomerPhone(customer.getPhone());
            response.setCustomerIdentity(customer.getIdentity());
        }

        boolean isUnpaid = invoice.getStatus().name().equals("UNPAID");
        LocalDateTime now = LocalDateTime.now();

        List<InvoiceRoomDetailDto> roomDetails = new java.util.ArrayList<>();
        BigDecimal totalRoomPriceCalc = BigDecimal.ZERO;
        BigDecimal totalServicePriceCalc = BigDecimal.ZERO;

        if (isUnpaid) {
            for (com.karaoke.backend.entity.BookingRoom br : invoice.getBooking().getBookingRooms()) {
                if (br.getStatus().name().equals("CANCELLED") || br.getStatus().name().equals("RESERVED")) continue;

                InvoiceRoomDetailDto dto = new InvoiceRoomDetailDto();
                dto.setId(null);
                dto.setBookingRoomId(br.getId());
                dto.setRoomName(br.getRoom().getName());
                dto.setPricePerHour(calculateCurrentRoomPrice(br.getRoom().getId()));
                dto.setCheckinTime(br.getCheckinTime());
                
                LocalDateTime endCalc = br.getCheckoutTime() != null ? br.getCheckoutTime() : now;
                dto.setCheckoutTime(endCalc);

                if (br.getCheckinTime() != null) {
                    PricingCalculationResult calcResult = pricingEngine.calculateRoomPriceWithSlices(
                            br.getRoom().getId(), br.getCheckinTime(), endCalc
                    );
                    dto.setHoursUsed(calcResult.getTotalHours());
                    dto.setTotalAmount(calcResult.getTotalCost());
                    dto.setPriceBreakdowns(calcResult.getSlices());
                } else {
                    dto.setHoursUsed(BigDecimal.ZERO);
                    dto.setTotalAmount(BigDecimal.ZERO);
                }
                totalRoomPriceCalc = totalRoomPriceCalc.add(dto.getTotalAmount() != null ? dto.getTotalAmount() : BigDecimal.ZERO);
                roomDetails.add(dto);
            }
        } else {
            roomDetails = invoice.getRoomDetails().stream().map(ird -> {
                InvoiceRoomDetailDto dto = new InvoiceRoomDetailDto();
                dto.setId(ird.getId());
                dto.setBookingRoomId(ird.getBookingRoom().getId());
                dto.setRoomName(ird.getBookingRoom().getRoom().getName());
                dto.setCheckinTime(ird.getBookingRoom().getCheckinTime());
                dto.setCheckoutTime(ird.getBookingRoom().getCheckoutTime());
                dto.setHoursUsed(ird.getHoursUsed());
                dto.setTotalAmount(ird.getTotalPrice());

                List<TimeSliceDto> historicalSlices = ird.getSlices().stream().map(s -> {
                    TimeSliceDto sliceDto = new TimeSliceDto();
                    sliceDto.setStartTime(s.getStartTime());
                    sliceDto.setEndTime(s.getEndTime());
                    sliceDto.setPricePerHour(s.getPricePerHour());
                    sliceDto.setHours(s.getHoursUsed());
                    sliceDto.setAmount(s.getTotalAmount());
                    return sliceDto;
                }).collect(Collectors.toList());
                dto.setPriceBreakdowns(historicalSlices);
                return dto;
            }).collect(Collectors.toList());
        }
        response.setRoomDetails(roomDetails);

        // Xử lý Món ăn / Dịch vụ
        List<InvoiceItemDetail> itemDetails = invoice.getItems().stream().map(ii -> {
            InvoiceItemDetail dto = new InvoiceItemDetail();
            dto.setId(ii.getId());
            dto.setProductId(ii.getProduct().getId());
            dto.setProductName(ii.getProduct().getName());
            if (ii.getBookingRoom() != null) {
                dto.setBookingRoomId(ii.getBookingRoom().getId());
                dto.setRoomName(ii.getBookingRoom().getRoom().getName());
            }
            dto.setQuantity(ii.getQuantity());
            dto.setUnitPrice(ii.getUnitPrice());
            dto.setTotalAmount(ii.getTotalPrice());
            return dto;
        }).collect(Collectors.toList());
        response.setItemDetails(itemDetails);

        if (isUnpaid) {
            response.setTotalRoomPrice(totalRoomPriceCalc);
            for (InvoiceItemDetail item : itemDetails) {
                if (item.getTotalAmount() != null) {
                    totalServicePriceCalc = totalServicePriceCalc.add(item.getTotalAmount());
                }
            }
            response.setTotalServicePrice(totalServicePriceCalc);
            
            BigDecimal discount = response.getDiscount() != null ? response.getDiscount() : BigDecimal.ZERO;
            BigDecimal finalPrice = totalRoomPriceCalc.add(totalServicePriceCalc).subtract(discount);
            if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
                finalPrice = BigDecimal.ZERO;
            }
            response.setTotalPrice(finalPrice);
        }

        return response;
    }

    @Transactional
    @Override
    public void markAsPaid(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));

        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID)
        {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        BigDecimal totalRoomPrice = BigDecimal.ZERO;
        for (com.karaoke.backend.entity.BookingRoom br : invoice.getBooking().getBookingRooms()) {
            if (br.getStatus().name().equals("CANCELLED") || br.getStatus().name().equals("RESERVED")) continue;

            LocalDateTime endCalc = br.getCheckoutTime() != null ? br.getCheckoutTime() : now;
            
            InvoiceRoomDetail ird = new InvoiceRoomDetail();
            ird.setInvoice(invoice);
            ird.setBookingRoom(br);
            
            if (br.getCheckinTime() != null) {
                PricingCalculationResult calcResult = pricingEngine.calculateRoomPriceWithSlices(
                        br.getRoom().getId(), br.getCheckinTime(), endCalc
                );
                ird.setHoursUsed(calcResult.getTotalHours());
                ird.setTotalPrice(calcResult.getTotalCost());
                
                for (com.karaoke.backend.dto.response.TimeSliceDto sliceDto : calcResult.getSlices()) {
                    InvoiceRoomDetailSlice slice = new InvoiceRoomDetailSlice();
                    slice.setInvoiceRoomDetail(ird);
                    slice.setStartTime(sliceDto.getStartTime());
                    slice.setEndTime(sliceDto.getEndTime());
                    slice.setPricePerHour(sliceDto.getPricePerHour());
                    slice.setHoursUsed(sliceDto.getHours());
                    slice.setTotalAmount(sliceDto.getAmount());
                    ird.getSlices().add(slice);
                }
            } else {
                ird.setHoursUsed(BigDecimal.ZERO);
                ird.setTotalPrice(BigDecimal.ZERO);
            }
            totalRoomPrice = totalRoomPrice.add(ird.getTotalPrice() != null ? ird.getTotalPrice() : BigDecimal.ZERO);
            invoice.getRoomDetails().add(ird);
        }

        BigDecimal totalServicePrice = BigDecimal.ZERO;
        for (InvoiceItem item : invoice.getItems()) {
            totalServicePrice = totalServicePrice.add(item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO);
        }

        invoice.setRoomPrice(totalRoomPrice);
        invoice.setServicePrice(totalServicePrice);

        BigDecimal discount = invoice.getDiscount() != null ? invoice.getDiscount() : BigDecimal.ZERO;
        BigDecimal finalPrice = totalRoomPrice.add(totalServicePrice).subtract(discount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }
        invoice.setTotalPrice(finalPrice);

        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoice.setPaidAt(now);

        invoiceRepository.save(invoice);
    }

    public BigDecimal calculateCurrentRoomPrice(Integer roomId)
    {
        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();
        LocalDate today = now.toLocalDate();
        String dayOfWeekStr = now.getDayOfWeek().name().substring(0, 3).toUpperCase();
        RoomPrice.DayOfWeek dayEnum = RoomPrice.DayOfWeek.valueOf(dayOfWeekStr);

        Double specialPrice = roomPriceSpecialRepository.findPrice(roomId, today, currentTime);
        if (specialPrice != null) BigDecimal.valueOf(specialPrice);

        Double normalPrice = roomPriceRepository.findPrice(roomId, dayEnum, currentTime);
        if (normalPrice != null) return BigDecimal.valueOf(normalPrice);

        return BigDecimal.valueOf(0.0);
    }
}
