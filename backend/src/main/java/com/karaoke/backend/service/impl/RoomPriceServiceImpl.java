package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.WeeklyPriceRequest;
import com.karaoke.backend.dto.response.RoomPricingResponse;
import com.karaoke.backend.entity.Booking;
import com.karaoke.backend.entity.Room;
import com.karaoke.backend.entity.RoomPrice;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.RoomPriceRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.service.RoomPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomPriceServiceImpl implements RoomPriceService {

    private final RoomPriceRepository roomPriceRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public RoomPricingResponse getWeeklyPricing() {
        List<Room> rooms = roomRepository.findAll();
        
        List<RoomPricingResponse.RoomInfo> roomInfos = rooms.stream().map(room -> {
            List<RoomPrice> prices = roomPriceRepository.findByRoomId(room.getId());
            
            List<RoomPricingResponse.PriceSlotInfo> priceSlots = prices.stream().map(p -> 
                RoomPricingResponse.PriceSlotInfo.builder()
                        .id(p.getId())
                        .dayOfWeek(p.getDayOfWeek())
                        .startTime(p.getStartTime())
                        .endTime(p.getEndTime())
                        .pricePerHour(p.getPricePerHour())
                        .build()
            ).collect(Collectors.toList());

            return RoomPricingResponse.RoomInfo.builder()
                    .id(room.getId())
                    .name(room.getName())
                    .category(room.getCategory().name())
                    .prices(priceSlots)
                    .build();
        }).collect(Collectors.toList());

        return RoomPricingResponse.builder()
                .rooms(roomInfos)
                .build();
    }

    @Override
    @Transactional
    public void updateWeeklyPrices(Integer roomId, List<WeeklyPriceRequest> requests) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        // 1. Lấy toàn bộ giá hiện tại để kiểm tra chồng lấn nội bộ (vì giờ vẫn có thể đổi)
        List<RoomPrice> allRoomPrices = new ArrayList<>(roomPriceRepository.findByRoomId(roomId));

        // 2. Lấy các Booking đang hoạt động
        List<Booking.BookingStatus> activeStatuses = Arrays.asList(
                Booking.BookingStatus.BOOKED, 
                Booking.BookingStatus.CHECKED_IN
        );
        List<Booking> activeBookings = bookingRepository.findByRoomIdAndStatuses(roomId, activeStatuses);

        for (WeeklyPriceRequest req : requests) {
            // Ràng buộc: Bắt buộc có ID
            if (req.getId() == null) {
                throw new IllegalArgumentException("ID khung giá là bắt buộc.");
            }

            RoomPrice priceToUpdate = roomPriceRepository.findById(req.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khung giá với id: " + req.getId()));

            if (!priceToUpdate.getRoom().getId().equals(roomId)) {
                throw new IllegalArgumentException("Khung giá ID " + req.getId() + " không thuộc về phòng này.");
            }

            // Điền dữ liệu thiếu từ DB để so sánh
            if (req.getStartTime() == null) req.setStartTime(priceToUpdate.getStartTime());
            if (req.getEndTime() == null) req.setEndTime(priceToUpdate.getEndTime());
            if (req.getDayOfWeek() == null) req.setDayOfWeek(priceToUpdate.getDayOfWeek());
            if (req.getPricePerHour() == null) req.setPricePerHour(priceToUpdate.getPricePerHour());

            boolean isChanged = req.getPricePerHour().compareTo(priceToUpdate.getPricePerHour()) != 0 ||
                                !req.getStartTime().equals(priceToUpdate.getStartTime()) ||
                                !req.getEndTime().equals(priceToUpdate.getEndTime()) ||
                                !req.getDayOfWeek().equals(priceToUpdate.getDayOfWeek());
            
            if (isChanged) {
                // A. Kiểm tra chồng lấn nội bộ (với khung giờ MỚI định đổi)
                validateNoInternalPriceOverlap(req, allRoomPrices, priceToUpdate.getId());

                // B. Kiểm tra Booking
                validateNoBookingOverlap(priceToUpdate.getDayOfWeek(), priceToUpdate.getStartTime(), priceToUpdate.getEndTime(), activeBookings);
                if (!req.getStartTime().equals(priceToUpdate.getStartTime()) || !req.getEndTime().equals(priceToUpdate.getEndTime()) || !req.getDayOfWeek().equals(priceToUpdate.getDayOfWeek())) {
                    validateNoBookingOverlap(req.getDayOfWeek(), req.getStartTime(), req.getEndTime(), activeBookings);
                }

                priceToUpdate.setDayOfWeek(req.getDayOfWeek());
                priceToUpdate.setStartTime(req.getStartTime());
                priceToUpdate.setEndTime(req.getEndTime());
                priceToUpdate.setPricePerHour(req.getPricePerHour());
                
                roomPriceRepository.save(priceToUpdate);
                updateAllPricesList(allRoomPrices, priceToUpdate);
            }
        }
    }

    private void validateNoInternalPriceOverlap(WeeklyPriceRequest req, List<RoomPrice> allPrices, Integer excludeId) {
        for (RoomPrice p : allPrices) {
            if (p.getDayOfWeek() == req.getDayOfWeek() && !p.getId().equals(excludeId)) {
                if (isTimeOverlap(req.getStartTime(), req.getEndTime(), p.getStartTime(), p.getEndTime())) {
                    throw new IllegalStateException("Khung giờ định sửa (" + req.getStartTime() + " - " + req.getEndTime() + 
                        ") chồng lấn với khung giá" + " (" + p.getStartTime() + " - " + p.getEndTime() + ") của phòng này.");
                }
            }
        }
    }

    private void updateAllPricesList(List<RoomPrice> allPrices, RoomPrice updated) {
        for (int i = 0; i < allPrices.size(); i++) {
            if (allPrices.get(i).getId().equals(updated.getId())) {
                allPrices.set(i, updated);
                break;
            }
        }
    }

    private void validateNoBookingOverlap(RoomPrice.DayOfWeek dayOfWeek, LocalTime start, LocalTime end, List<Booking> bookings) {
        for (Booking b : bookings) {
            if (b.getReservationTime().getDayOfWeek().name().startsWith(dayOfWeek.name())) {
                LocalTime bStart = b.getReservationTime().toLocalTime();
                LocalTime bEnd = b.getExpectedCheckoutTime().toLocalTime();
                if (isTimeOverlap(start, end, bStart, bEnd)) {
                    throw new IllegalStateException("Không thể đổi khung giờ/giá " + dayOfWeek + " (" + start + "-" + end + 
                        ") do có lịch đặt phòng của khách vào lúc " + b.getReservationTime());
                }
            }
        }
    }

    private boolean isTimeOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        if (start1.isAfter(end1)) {
            return isTimeOverlap(start1, LocalTime.MAX, start2, end2) || 
                   isTimeOverlap(LocalTime.MIN, end1, start2, end2);
        }
        if (start2.isAfter(end2)) {
            return isTimeOverlap(start1, end1, start2, LocalTime.MAX) || 
                   isTimeOverlap(start1, end1, LocalTime.MIN, end2);
        }
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    @Override
    @Transactional
    public void updateTimeSlots(List<com.karaoke.backend.dto.request.TimeSlotUpdateRequest> requests) {
        if (requests == null || requests.isEmpty()) return;
        List<RoomPrice> allPrices = roomPriceRepository.findAll();
        List<RoomPrice> modifiedRecords = new java.util.ArrayList<>();

        // 1. Cập nhật trên memory
        for (com.karaoke.backend.dto.request.TimeSlotUpdateRequest req : requests) {
            for (RoomPrice p : allPrices) {
                if (p.getStartTime().equals(req.getOldStartTime()) && p.getEndTime().equals(req.getOldEndTime())) {
                    p.setStartTime(req.getNewStartTime());
                    p.setEndTime(req.getNewEndTime());
                    if (!modifiedRecords.contains(p)) modifiedRecords.add(p);
                }
            }
        }

        // 2. Validate chồng lấn nội bộ trong cùng 1 phòng, cùng 1 ngày
        for (int i = 0; i < allPrices.size(); i++) {
            RoomPrice p1 = allPrices.get(i);
            for (int j = i + 1; j < allPrices.size(); j++) {
                RoomPrice p2 = allPrices.get(j);
                if (p1.getRoom().getId().equals(p2.getRoom().getId()) && p1.getDayOfWeek() == p2.getDayOfWeek()) {
                    if (isTimeOverlap(p1.getStartTime(), p1.getEndTime(), p2.getStartTime(), p2.getEndTime())) {
                        throw new IllegalStateException("Khung giờ sau khi sửa bị chồng lấn: (" + 
                             p1.getStartTime() + " - " + p1.getEndTime() + ") đè lên (" + 
                             p2.getStartTime() + " - " + p2.getEndTime() + ")");
                    }
                }
            }
        }

        roomPriceRepository.saveAll(modifiedRecords);
    }
}
