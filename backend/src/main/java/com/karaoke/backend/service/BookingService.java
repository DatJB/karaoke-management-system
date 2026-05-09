package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.BookingCreateRequest;
import com.karaoke.backend.dto.request.BookingUpdateRequest;
import com.karaoke.backend.dto.response.BookingDetailResponse;
import com.karaoke.backend.dto.response.BookingResponse;
import com.karaoke.backend.dto.response.PageResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface BookingService
{
    PageResponse<BookingResponse> getCustomerBookings(Integer customerId, LocalDate date, int page, int size);

    BookingDetailResponse getBookingDetail(Integer id);

    void addRoomToBooking(Integer bookingId, Integer roomId);

    BookingDetailResponse updateBookingInfo(Integer bookingId, BookingUpdateRequest request);

    void removeRoomFromBooking(Integer bookingId, Integer roomId);

    void deleteBooking(Integer bookingId);

    void checkInSingleRoom(Integer bookingId, Integer roomId);

    void checkInAllRooms(Integer bookingId);

    BookingDetailResponse createBooking(BookingCreateRequest request);

    void checkOutSingleRoom(Integer bookingId, Integer roomId);

    void checkOutAllRooms(Integer bookingId);

    void cancelBooking(Integer bookingId);
}
