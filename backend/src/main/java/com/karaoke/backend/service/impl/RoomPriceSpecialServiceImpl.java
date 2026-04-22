package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.RoomPriceSpecialRequest;
import com.karaoke.backend.dto.response.RoomPriceSpecialResponse;
import com.karaoke.backend.entity.Booking;
import com.karaoke.backend.entity.Room;
import com.karaoke.backend.entity.RoomPriceSpecial;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.RoomPriceSpecialRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.service.RoomPriceSpecialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.karaoke.backend.util.TimeUtils;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomPriceSpecialServiceImpl implements RoomPriceSpecialService {

    private final RoomPriceSpecialRepository roomPriceSpecialRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public List<RoomPriceSpecialResponse> addSpecialPrices(Integer roomId, List<RoomPriceSpecialRequest> requests) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        List<RoomPriceSpecialResponse> responses = new ArrayList<>();
        
        for (RoomPriceSpecialRequest request : requests) {
            // Kiểm tra chồng lấn với các giá đặc biệt khác của phòng này trong cùng ngày
            List<RoomPriceSpecial> existingSpecials = roomPriceSpecialRepository.findByRoomIdAndSpecialDate(roomId, request.getSpecialDate());

            for (RoomPriceSpecial existing : existingSpecials) {
                if (TimeUtils.isTimeOverlap(request.getStartTime(), request.getEndTime(), existing.getStartTime(), existing.getEndTime())) {
                    throw new IllegalStateException("Khung giờ đặc biệt " + request.getStartTime() + "-" + request.getEndTime() + " bị chồng lấn với dữ liệu đã có.");
                }
            }

            validateNoBookingOverlap(roomId, request.getSpecialDate(), request.getStartTime(), request.getEndTime());

            RoomPriceSpecial specialPrice = RoomPriceSpecial.builder()
                    .room(room)
                    .specialDate(request.getSpecialDate())
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .pricePerHour(request.getPricePerHour())
                    .note(request.getNote())
                    .build();

            responses.add(mapToResponse(roomPriceSpecialRepository.save(specialPrice)));
        }

        return responses;
    }

    @Override
    public List<RoomPriceSpecialResponse> getSpecialPricesByRoom(Integer roomId) {
        return roomPriceSpecialRepository.findByRoomId(roomId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomPriceSpecialResponse updateSpecialPrice(Integer id, RoomPriceSpecialRequest request) {
        RoomPriceSpecial specialPrice = roomPriceSpecialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Special price not found with id: " + id));

        // Kiểm tra chồng lấn
        List<RoomPriceSpecial> existingSpecials = roomPriceSpecialRepository.findByRoomIdAndSpecialDate(specialPrice.getRoom().getId(), request.getSpecialDate());
        for (RoomPriceSpecial existing : existingSpecials) {
            if (!existing.getId().equals(id) && TimeUtils.isTimeOverlap(request.getStartTime(), request.getEndTime(), existing.getStartTime(), existing.getEndTime())) {
                throw new IllegalStateException("Khung giờ đặc biệt bị chồng lấn.");
            }
        }

        // Kiểm tra lịch đặt phòng cho khung giờ cũ và mới
        validateNoBookingOverlap(specialPrice.getRoom().getId(), specialPrice.getSpecialDate(), specialPrice.getStartTime(), specialPrice.getEndTime());
        if (!request.getStartTime().equals(specialPrice.getStartTime()) || !request.getEndTime().equals(specialPrice.getEndTime()) || !request.getSpecialDate().equals(specialPrice.getSpecialDate())) {
            validateNoBookingOverlap(specialPrice.getRoom().getId(), request.getSpecialDate(), request.getStartTime(), request.getEndTime());
        }

        specialPrice.setSpecialDate(request.getSpecialDate());
        specialPrice.setStartTime(request.getStartTime());
        specialPrice.setEndTime(request.getEndTime());
        specialPrice.setPricePerHour(request.getPricePerHour());
        specialPrice.setNote(request.getNote());

        return mapToResponse(roomPriceSpecialRepository.save(specialPrice));
    }

    @Override
    @Transactional
    public void deleteSpecialPrice(Integer id) {
        RoomPriceSpecial specialPrice = roomPriceSpecialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Special price not found with id: " + id));

        // Kiểm tra lịch đặt phòng trước khi xóa
        validateNoBookingOverlap(specialPrice.getRoom().getId(), specialPrice.getSpecialDate(), specialPrice.getStartTime(), specialPrice.getEndTime());

        roomPriceSpecialRepository.delete(specialPrice);
    }

    private void validateNoBookingOverlap(Integer roomId, java.time.LocalDate date, LocalTime start, LocalTime end) {
        List<Booking.BookingStatus> activeStatuses = Arrays.asList(Booking.BookingStatus.BOOKED, Booking.BookingStatus.CHECKED_IN);
        List<Booking> activeBookings = bookingRepository.findByRoomIdAndStatuses(roomId, activeStatuses);

        for (Booking b : activeBookings) {
            if (b.getReservationTime().toLocalDate().equals(date)) {
                LocalTime bStart = b.getReservationTime().toLocalTime();
                LocalTime bEnd = b.getExpectedCheckoutTime().toLocalTime();

                if (TimeUtils.isTimeOverlap(start, end, bStart, bEnd)) {
                    throw new IllegalStateException("Không thể thay đổi/xóa giá đặc biệt do đã có lịch đặt phòng vào lúc " + b.getReservationTime());
                }
            }
        }
    }

    // isTimeOverlap has been moved to TimeUtils

    private RoomPriceSpecialResponse mapToResponse(RoomPriceSpecial entity) {
        return RoomPriceSpecialResponse.builder()
                .id(entity.getId())
                .roomId(entity.getRoom().getId())
                .roomName(entity.getRoom().getName())
                .specialDate(entity.getSpecialDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .pricePerHour(entity.getPricePerHour())
                .note(entity.getNote())
                .build();
    }
}
