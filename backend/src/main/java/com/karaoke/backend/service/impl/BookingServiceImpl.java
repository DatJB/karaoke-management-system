package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.BookingCreateRequest;
import com.karaoke.backend.dto.request.BookingUpdateRequest;
import com.karaoke.backend.dto.response.BookingDetailResponse;
import com.karaoke.backend.dto.response.BookingResponse;
import com.karaoke.backend.dto.response.BookingRoomDetailResponse;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.entity.*;
import com.karaoke.backend.exception.BusinessException;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.*;
import com.karaoke.backend.service.BookingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.naming.spi.ResolveResult;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService
{
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final BookingRoomRepository bookingRoomRepository;
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    @Override
    public PageResponse<BookingResponse> getCustomerBookings(
            Integer customerId,
            LocalDate date,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").descending());

        LocalDateTime startDate = null;
        LocalDateTime endDate = null;

        if (date != null) {
            startDate = date.atStartOfDay();
            endDate = date.atTime(23, 59, 59);
        }

        Page<Booking> bookingPage = bookingRepository.findByCustomerWithFilters(
                customerId, startDate, endDate, pageable);

        List<BookingResponse> data = bookingPage.getContent().stream()
                .map(booking -> BookingResponse.builder()
                        .id(booking.getId())
                        .status(booking.getStatus().name())
                        .reservationTime(booking.getReservationTime())
                        .expectedCheckoutTime(booking.getExpectedCheckoutTime())
                        .note(booking.getNote())
                        .roomCount(booking.getBookingRooms().size())
                        .build())
                .toList();

        return PageResponse.<BookingResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .data(data)
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .build();
    }

    @Override
    public BookingDetailResponse getBookingDetail(Integer id)
    {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + id));

        List<BookingRoomDetailResponse> roomDetails = booking.getBookingRooms().stream()
                .map(br -> BookingRoomDetailResponse.builder()
                        .bookingRoomId(br.getId())
                        .roomId(br.getRoom().getId())
                        .roomName(br.getRoom().getName())
                        .status(br.getStatus().name())
                        .checkInTime(br.getCheckinTime())
                        .checkOutTime(br.getCheckoutTime())
                        .build())
                .toList();

        return BookingDetailResponse.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .reservationTime(booking.getReservationTime())
                .expectedCheckoutTime(booking.getExpectedCheckoutTime())
                .note(booking.getNote())
                .roomDetails(roomDetails)
                .build();
    }

    @Override
    @Transactional
    public void addRoomToBooking(Integer bookingId, Integer roomId)
    {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        if (!booking.getStatus().name().equals("BOOKED") &&
                !booking.getStatus().name().equals("CHECKED_IN"))
        {
            throw new BusinessException("Chỉ có thể thêm phòng khi phiếu ở trạng thái 'ĐÃ ĐẶT' hoặc 'NHẬN PHÒNG'");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Phòng ID: " + roomId));

        boolean isRoomAlreadyAdded = booking.getBookingRooms().stream()
                .anyMatch(br -> br.getRoom().getId().equals(room.getId()));
        if (isRoomAlreadyAdded) {
            throw new BusinessException("Phòng " + room.getName() + " đã có sẵn trong phiếu đặt này!");
        }

        if (room.getStatus().name().equals("OCCUPIED"))
        {
            if (booking.getStatus().name().equals("CHECKED_IN") ||
                    booking.getReservationTime().isBefore(LocalDateTime.now().plusMinutes(15))) {
                throw new BusinessException("Phòng " + room.getName() +
                        " hiện tại ĐANG CÓ KHÁCH HÁT, không thể xếp để sử dụng ngay!");
            }
        }

        long overlapCount = bookingRoomRepository.countOverlappingReservations(
                roomId,
                booking.getId(),
                booking.getReservationTime(),
                booking.getExpectedCheckoutTime()
        );

        if (overlapCount > 0) {
            throw new BusinessException("Phòng " + room.getName() +
                    " đã có khách đặt hoặc đang sử dụng trong khoảng thời gian này!");
        }

        BookingRoom newBookingRoom = new BookingRoom();
        newBookingRoom.setBooking(booking);
        newBookingRoom.setRoom(room);

        if (booking.getStatus().name().equals("CHECKED_IN"))
        {
            newBookingRoom.setStatus(BookingRoom.BookingRoomStatus.PLAYING);
            newBookingRoom.setCheckinTime(LocalDateTime.now());

            room.setStatus(Room.RoomStatus.OCCUPIED);
        }
        else
        {
            newBookingRoom.setStatus(BookingRoom.BookingRoomStatus.RESERVED);
        }

        bookingRoomRepository.save(newBookingRoom);
        roomRepository.save(room);
    }

    @Override
    @Transactional
    public BookingDetailResponse updateBookingInfo(Integer bookingId, BookingUpdateRequest request)
    {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        if (booking.getStatus().name().equals("DONE") || booking.getStatus().name().equals("CANCELLED"))
        {
            throw new BusinessException("Không thể chỉnh sửa phiếu đã hoàn thành hoặc đã hủy!");
        }

        if (request.getExpectedCheckoutTime().isBefore(request.getReservationTime()))
        {
            throw new BusinessException("Giờ trả phòng dự kiến không thể diễn ra trước giờ nhận phòng!");
        }

        // Check overlap
        for (BookingRoom br : booking.getBookingRooms())
        {
            if (br.getStatus().name().equals("CANCELLED")) continue;

            long overlapCount = bookingRoomRepository.countOverlappingReservations(
                    br.getRoom().getId(),
                    booking.getId(),
                    request.getReservationTime(),
                    request.getExpectedCheckoutTime()
            );

            if (overlapCount > 0)
            {
                throw new BusinessException("Không thể cập nhật! Phòng " + br.getRoom().getName() +
                        " đã vướng lịch khách khác trong khung giờ mới này.");
            }
        }

        booking.setReservationTime(request.getReservationTime());
        booking.setExpectedCheckoutTime(request.getExpectedCheckoutTime());
        booking.setNote(request.getNote());

        bookingRepository.save(booking);

        return getBookingDetail(booking.getId());
    }

    @Override
    @Transactional
    public void removeRoomFromBooking(Integer bookingId, Integer roomId)
    {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        BookingRoom bookingRoom = booking.getBookingRooms().stream()
                .filter(br -> br.getRoom().getId().equals(roomId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Phòng này không tồn tại trong phiếu đặt!"));

        if (!bookingRoom.getStatus().name().equals("RESERVED")) {
            throw new BusinessException("Chỉ có thể xóa phòng khi chưa Check-in");
        }

        if (booking.getBookingRooms().size() <= 1) {
            throw new BusinessException("Đây là phòng duy nhất của phiếu. Vui lòng dùng chức năng Hủy Booking thay vì xóa phòng.");
        }

        Room room = bookingRoom.getRoom();
        room.setStatus(Room.RoomStatus.AVAILABLE);
        roomRepository.save(room);

        booking.getBookingRooms().remove(bookingRoom);

        bookingRoomRepository.delete(bookingRoom);
    }

    @Override
    @Transactional
    public void deleteBooking(Integer bookingId)
    {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        if (invoiceRepository.existsByBookingId(bookingId))
        {
            throw new BusinessException("Không thể xóa vĩnh viễn phiếu đã xuất hóa đơn. Vui lòng dùng chức năng Hủy (Cancel).");
        }

        for (BookingRoom br : booking.getBookingRooms())
        {
            if (br.getStatus().name().equals("RESERVED") || br.getStatus().name().equals("PLAYING"))
            {
                Room room = br.getRoom();
                room.setStatus(Room.RoomStatus.AVAILABLE);
                roomRepository.save(room);
            }
        }

        bookingRoomRepository.deleteAll(booking.getBookingRooms());
        bookingRepository.delete(booking);
    }

    // Create invoice
    private void createInvoiceIfNotExists(Booking booking)
    {
        if (!invoiceRepository.existsByBookingId(booking.getId()))
        {
            Invoice invoice = new Invoice();
            invoice.setBooking(booking);
            invoice.setStatus(Invoice.InvoiceStatus.UNPAID);
            invoice.setRoomPrice(BigDecimal.ZERO);
            invoice.setServicePrice(BigDecimal.ZERO);
            invoice.setDiscount(BigDecimal.ZERO);
            invoice.setTotalPrice(BigDecimal.ZERO);

            invoiceRepository.save(invoice);
        }
    }

    @Override
    @Transactional
    public void checkInSingleRoom(Integer bookingId, Integer roomId)
    {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        BookingRoom bookingRoom = booking.getBookingRooms().stream()
                .filter(br -> br.getRoom().getId().equals(roomId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Phòng này không thuộc phiếu đặt hiện tại!"));

        if (!bookingRoom.getStatus().name().equals("RESERVED"))
        {
            throw new BusinessException("Phòng này không ở trạng thái chờ nhận (ĐÃ ĐẶT)!");
        }

        bookingRoom.setStatus(BookingRoom.BookingRoomStatus.PLAYING);
        bookingRoom.setCheckinTime(LocalDateTime.now());

        Room room = bookingRoom.getRoom();
        room.setStatus(Room.RoomStatus.OCCUPIED);
        roomRepository.save(room);

        if (booking.getStatus().name().equals("BOOKED"))
        {
            booking.setStatus(Booking.BookingStatus.CHECKED_IN);
            bookingRepository.save(booking);

            createInvoiceIfNotExists(booking);
        }
    }

    @Override
    @Transactional
    public void checkInAllRooms(Integer bookingId)
    {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        if (!booking.getStatus().name().equals("BOOKED") && !booking.getStatus().name().equals("CHECKED_IN"))
        {
            throw new BusinessException("Phiếu đặt này không hợp lệ để check-in!");
        }

        boolean hasRoomCheckedIn = false;

        for (BookingRoom br : booking.getBookingRooms())
        {
            if (br.getStatus().name().equals("RESERVED"))
            {
                br.setStatus(BookingRoom.BookingRoomStatus.PLAYING);
                br.setCheckinTime(LocalDateTime.now());

                Room room = br.getRoom();
                room.setStatus(Room.RoomStatus.OCCUPIED);
                roomRepository.save(room);

                hasRoomCheckedIn = true;
            }
        }

        if (!hasRoomCheckedIn)
        {
            throw new BusinessException("Không có phòng nào trong trạng thái chờ nhận để check-in!");
        }

        if (booking.getStatus().name().equals("BOOKED"))
        {
            booking.setStatus(Booking.BookingStatus.CHECKED_IN);
            bookingRepository.save(booking);

            createInvoiceIfNotExists(booking);
        }
    }

    @Override
    @Transactional
    public BookingDetailResponse createBooking(BookingCreateRequest request)
    {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Khách hàng với ID: " + request.getCustomerId()));

        if (request.getExpectedCheckoutTime().isBefore(request.getReservationTime())) {
            throw new BusinessException("Giờ trả phòng không thể diễn ra trước giờ nhận phòng!");
        }

        List<Room> selectedRooms = new ArrayList<>();
        for (Integer roomId : request.getRoomIds()) {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new ResourceNotFoundException("Phòng ID " + roomId + " không tồn tại!"));

            long overlapCount = bookingRoomRepository.countOverlappingReservations(
                    roomId,
                    -1,
                    request.getReservationTime(),
                    request.getExpectedCheckoutTime()
            );

            if (overlapCount > 0) {
                throw new BusinessException("Phòng " + room.getName() + " đã có người đặt trong khung giờ này. Vui lòng chọn phòng khác!");
            }

            selectedRooms.add(room);
        }

        Booking newBooking = new Booking();
        newBooking.setCustomer(customer);
        newBooking.setReservationTime(request.getReservationTime());
        newBooking.setExpectedCheckoutTime(request.getExpectedCheckoutTime());
        newBooking.setNote(request.getNote());

        if (request.isCheckInImmediately()) {
            newBooking.setStatus(Booking.BookingStatus.CHECKED_IN);
        } else {
            newBooking.setStatus(Booking.BookingStatus.BOOKED);
        }

        newBooking.setBookingRooms(new ArrayList<>());

        Booking savedBooking = bookingRepository.save(newBooking);

        LocalDateTime now = LocalDateTime.now();
        List<BookingRoom> bookingRoomsToSave = new ArrayList<>();

        for (Room room : selectedRooms) {
            BookingRoom bookingRoom = new BookingRoom();
            bookingRoom.setBooking(savedBooking);
            bookingRoom.setRoom(room);

            if (request.isCheckInImmediately()) {
                bookingRoom.setStatus(BookingRoom.BookingRoomStatus.PLAYING);
                bookingRoom.setCheckinTime(now);
                room.setStatus(Room.RoomStatus.OCCUPIED);
            } else {
                bookingRoom.setStatus(BookingRoom.BookingRoomStatus.RESERVED);
                if (request.getReservationTime().isBefore(now.plusMinutes(60))) {
                    room.setStatus(Room.RoomStatus.RESERVED);
                }
            }

            savedBooking.getBookingRooms().add(bookingRoom);
            bookingRoomsToSave.add(bookingRoom);
            roomRepository.save(room);
        }

        bookingRoomRepository.saveAll(bookingRoomsToSave);

        if (request.isCheckInImmediately()) {
            createInvoiceIfNotExists(savedBooking);
        }

        return getBookingDetail(savedBooking.getId());
    }

    @Override
    @Transactional
    public void checkOutSingleRoom(Integer bookingId, Integer roomId)
    {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        BookingRoom bookingRoom = booking.getBookingRooms().stream()
                .filter(br -> br.getRoom().getId().equals(roomId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Phòng này không thuộc phiếu đặt hiện tại!"));

        if (!bookingRoom.getStatus().name().equals("PLAYING"))
        {
            throw new BusinessException("Chỉ có thể trả phòng khi phòng đang có khách hát!");
        }

        bookingRoom.setCheckoutTime(LocalDateTime.now());
        bookingRoom.setStatus(BookingRoom.BookingRoomStatus.DONE);

        Room room = bookingRoom.getRoom();
        room.setStatus(Room.RoomStatus.AVAILABLE);
        roomRepository.save(room);

        List<BookingRoomEmployee> employees = bookingRoom.getEmployees();
        for (BookingRoomEmployee emp : employees)
        {
            if (emp.getEndTime() == null)
            {
                emp.setEndTime(LocalDateTime.now());
                emp.getEmployee().setStatus(Employee.EmployeeStatus.AVAILABLE);
            }
        }

        boolean isAllRoomsDone = booking.getBookingRooms().stream()
                .allMatch(br -> br.getStatus().name().equals("DONE") ||
                        br.getStatus().name().equals("CANCELLED"));

        if (isAllRoomsDone)
        {
            booking.setStatus(Booking.BookingStatus.CHECKED_OUT);
            bookingRepository.save(booking);
        }
    }

    @Override
    @Transactional
    public void checkOutAllRooms(Integer bookingId)
    {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        if (!booking.getStatus().name().equals("CHECKED_IN"))
        {
            throw new BusinessException("Chỉ có thể trả toàn bộ khi phiếu đang ở trạng thái NHẬN PHÒNG!");
        }

        boolean hasRoomCheckedOut = false;
        LocalDateTime now = LocalDateTime.now();

        for (BookingRoom br : booking.getBookingRooms())
        {
            if (br.getStatus().name().equals("PLAYING"))
            {
                br.setCheckoutTime(now);
                br.setStatus(BookingRoom.BookingRoomStatus.DONE);

                Room room = br.getRoom();
                room.setStatus(Room.RoomStatus.AVAILABLE);
                roomRepository.save(room);

                List<BookingRoomEmployee> employees = br.getEmployees();
                for (BookingRoomEmployee emp : employees)
                {
                    if (emp.getEndTime() == null)
                    {
                        emp.setEndTime(LocalDateTime.now());
                        emp.getEmployee().setStatus(Employee.EmployeeStatus.AVAILABLE);
                    }
                }

                hasRoomCheckedOut = true;
            }
        }

        if (!hasRoomCheckedOut)
        {
            throw new BusinessException("Không có phòng nào đang hát để trả!");
        }

        booking.setStatus(Booking.BookingStatus.CHECKED_OUT);
        bookingRepository.save(booking);
    }
}
