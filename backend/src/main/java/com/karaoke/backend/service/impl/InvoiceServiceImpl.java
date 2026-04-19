package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.response.*;
import com.karaoke.backend.entity.Customer;
import com.karaoke.backend.entity.Invoice;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.InvoiceRepository;
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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService
{
    private final InvoiceRepository invoiceRepository;
    private final KaraokePricingEngine pricingEngine;

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

        // Xử lý Tiền phòng hát (Live vs Đóng băng)
        List<InvoiceRoomDetailDto> roomDetails = invoice.getRoomDetails().stream().map(ird -> {
            InvoiceRoomDetailDto dto = new InvoiceRoomDetailDto();
            dto.setId(ird.getId());
            dto.setBookingRoomId(ird.getBookingRoom().getId());
            dto.setRoomName(ird.getBookingRoom().getRoom().getName());
            dto.setCheckinTime(ird.getBookingRoom().getCheckinTime());

            if (isUnpaid) {
                // Nhánh 1: LIVE (Tạm tính)
                dto.setCheckoutTime(now);
                PricingCalculationResult calcResult = pricingEngine.calculateRoomPriceWithSlices(
                        ird.getBookingRoom().getRoom().getId(), dto.getCheckinTime(), now
                );
                dto.setHoursUsed(calcResult.getTotalHours());
                dto.setTotalAmount(calcResult.getTotalCost());
                dto.setPriceBreakdowns(calcResult.getSlices());
            } else {
                // Nhánh 2: LỊCH SỬ (Đã thanh toán)
                dto.setCheckoutTime(ird.getBookingRoom().getCheckoutTime());
                dto.setHoursUsed(ird.getHoursUsed());
                dto.setTotalAmount(ird.getTotalPrice());

                // Móc dữ liệu từ bảng InvoiceRoomDetailSlice đưa lên UI
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
            }
            return dto;
        }).collect(Collectors.toList());
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

        return response;
    }
}
