package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.RoomRequest;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.dto.response.RoomResponse;
import com.karaoke.backend.dto.response.RoomStaffResponse;
import com.karaoke.backend.entity.BookingRoom;
import com.karaoke.backend.entity.Room;
import com.karaoke.backend.entity.RoomPrice;
import com.karaoke.backend.exception.BusinessException;
import com.karaoke.backend.exception.DuplicateResourceException;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.BookingRoomRepository;
import com.karaoke.backend.repository.RoomPriceRepository;
import com.karaoke.backend.repository.RoomPriceSpecialRepository;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService
{
    private final RoomRepository roomRepository;
    private final BookingRoomRepository bookingRoomRepository;
    private final RoomPriceRepository roomPriceRepository;
    private final RoomPriceSpecialRepository roomPriceSpecialRepository;

    @Override
    @Transactional
    public PageResponse<RoomResponse> getAllRooms(String categoryStr, String statusStr, Integer minSize, Integer maxSize, int page, int size)
    {
        Room.RoomCategory categoryEnum = null;
        if (categoryStr != null && !categoryStr.trim().isEmpty()) {
            try {
                categoryEnum = Room.RoomCategory.valueOf(categoryStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Loại phòng không hợp lệ!");
            }
        }

        Room.RoomStatus statusEnum = null;
        if (statusStr != null && !statusStr.trim().isEmpty()) {
            try {
                statusEnum = Room.RoomStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Trạng thái phòng không hợp lệ!");
            }
        }

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Room> roomPage = roomRepository.filterRooms(categoryEnum, statusEnum, minSize, maxSize, pageable);

        LocalDateTime now = LocalDateTime.now();

        List<RoomResponse> rooms = roomPage.getContent().stream().map(room -> {

            RoomResponse.RoomResponseBuilder builder = RoomResponse.builder()
                    .id(room.getId())
                    .name(room.getName())
                    .size(room.getSize())
                    .category(room.getCategory().name());

            String finalStatus = room.getStatus().name();

            if (finalStatus.equals("AVAILABLE"))
            {
                Optional<BookingRoom> upcomingOpt = bookingRoomRepository.findNextUpcomingBooking(room.getId(), now);

                if (upcomingOpt.isPresent())
                {
                    BookingRoom upcoming = upcomingOpt.get();
                    long minutesUntilArrival = ChronoUnit.MINUTES.between(now, upcoming.getBooking().getReservationTime());
                    System.out.println(minutesUntilArrival);

                    if (minutesUntilArrival <= 60)
                    {
                        finalStatus = "RESERVED";
                        builder.bookingId(upcoming.getBooking().getId());
                        builder.bookingRoomId(upcoming.getId());
                        builder.checkinTime(upcoming.getBooking().getReservationTime()); // reservation_time
                        builder.checkoutTime(upcoming.getBooking().getExpectedCheckoutTime());

                        if (upcoming.getBooking().getCustomer() != null) {
                            builder.customerName(upcoming.getBooking().getCustomer().getName());
                            builder.customerPhone(upcoming.getBooking().getCustomer().getPhone());
                        }
                    }
                }
            }

            if (finalStatus.equals("RESERVED"))
            {
                Optional<BookingRoom> br = bookingRoomRepository.findNextUpcomingBooking(room.getId(), now);
                if (br.isPresent())
                {
                    BookingRoom upcoming = br.get();
                    builder.bookingId(upcoming.getBooking().getId());
                    builder.bookingRoomId(upcoming.getId());
                    builder.checkinTime(upcoming.getBooking().getReservationTime()); // reservation_time
                    builder.checkoutTime(upcoming.getBooking().getExpectedCheckoutTime());

                    if (upcoming.getBooking().getCustomer() != null)
                    {
                        builder.customerName(upcoming.getBooking().getCustomer().getName());
                        builder.customerPhone(upcoming.getBooking().getCustomer().getPhone());
                    }
                }
            }

            builder.status(finalStatus);
            room.setStatus(Room.RoomStatus.valueOf(finalStatus));

            return builder.build();
        }).toList();

        return PageResponse.<RoomResponse>builder()
                .currentPage(page)
                .totalPages(roomPage.getTotalPages())
                .pageSize(size)
                .totalElements(roomPage.getTotalElements())
                .data(rooms)
                .build();
    }

    @Override
    @Transactional
    public RoomResponse getRoomDetail(Integer roomId)
    {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng"));

        RoomResponse.RoomResponseBuilder builder = RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .size(room.getSize())
                .category(room.getCategory().name())
                .status(room.getStatus().name())
                .currentPrice(calculateCurrentRoomPrice(room.getId()));


        LocalDateTime now = LocalDateTime.now();
        String dbStatus = room.getStatus().name();
        builder.status(dbStatus);

        if ("OCCUPIED".equals(room.getStatus().name()))
        {
            BookingRoom activeBR = bookingRoomRepository.findByRoomIdAndStatus(room.getId(), BookingRoom.BookingRoomStatus.PLAYING)
                    .orElse(null);

            if (activeBR != null) {
                builder.bookingRoomId(activeBR.getId())
                        .bookingId(activeBR.getBooking().getId())
                        .checkinTime(activeBR.getCheckinTime())
                        .checkoutTime(activeBR.getBooking().getExpectedCheckoutTime())
                        .customerId(activeBR.getBooking().getCustomer().getId())
                        .customerName(activeBR.getBooking().getCustomer().getName())
                        .customerPhone(activeBR.getBooking().getCustomer().getPhone());

                List<RoomStaffResponse> staffList = activeBR.getEmployees().stream()
                        .map(emp -> RoomStaffResponse.builder()
                                .id(emp.getEmployee().getId())
                                .code(emp.getEmployee().getCode())
                                .name(emp.getEmployee().getName())
                                .build())
                        .toList();
                builder.staffList(staffList);
            }
        }
        else if ("RESERVED".equals(room.getStatus().name()))
        {
            Optional<BookingRoom> upcomingOpt = bookingRoomRepository
                    .findFirstByRoomIdAndStatusOrderByIdAsc(room.getId(), BookingRoom.BookingRoomStatus.RESERVED);

            if (upcomingOpt.isPresent())
            {
                BookingRoom upcomingBR = upcomingOpt.get();
                if (upcomingBR.getBooking().getReservationTime() != null)
                {
                    long minutesUntilArrival = ChronoUnit.MINUTES.between(now, upcomingBR.getBooking().getReservationTime());

                    if (minutesUntilArrival <= 60) {
                        builder.status("RESERVED");
                        populateBookingInfo(builder, upcomingBR);
                    }
                } else
                {
                }
            }
        }

        return builder.build();
    }

    private void populateBookingInfo(RoomResponse.RoomResponseBuilder builder, BookingRoom br) {
        builder.bookingRoomId(br.getId())
                .bookingId(br.getBooking().getId())
                .checkinTime(br.getBooking().getReservationTime())
                .checkoutTime(br.getBooking().getExpectedCheckoutTime());

        if (br.getBooking().getCustomer() != null) {
            builder.customerId(br.getBooking().getCustomer().getId())
                    .customerName(br.getBooking().getCustomer().getName())
                    .customerPhone(br.getBooking().getCustomer().getPhone());
        }
    }

    private void populateStaffInfo(RoomResponse.RoomResponseBuilder builder, BookingRoom br) {
        List<RoomStaffResponse> staffList = br.getEmployees().stream()
                .map(emp -> RoomStaffResponse.builder()
                        .id(emp.getEmployee().getId())
                        .code(emp.getEmployee().getCode())
                        .name(emp.getEmployee().getName())
                        .build())
                .toList();
        builder.staffList(staffList);
    }

    public Double calculateCurrentRoomPrice(Integer roomId) {
        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();
        LocalDate today = now.toLocalDate();
        String dayOfWeekStr = now.getDayOfWeek().name().substring(0, 3).toUpperCase();
        RoomPrice.DayOfWeek dayEnum = RoomPrice.DayOfWeek.valueOf(dayOfWeekStr);

        Double specialPrice = roomPriceSpecialRepository.findPrice(roomId, today, currentTime);
        if (specialPrice != null) return specialPrice;

        Double normalPrice = roomPriceRepository.findPrice(roomId, dayEnum, currentTime);
        if (normalPrice != null) return normalPrice;

        return 0.0;
    }

    @Override
    public RoomResponse createRoom(RoomRequest request)
    {
        if (roomRepository.existsByName(request.getName()))
        {
            throw new DuplicateResourceException("Tên phòng đã tồn tại!");
        }

        Room room = new Room();
        room.setName(request.getName());
        room.setSize(request.getSize());
        room.setCategory(Room.RoomCategory.valueOf(request.getCategory()));
        if (request.getStatus() != null && !request.getStatus().isEmpty())
        {
            room.setStatus(Room.RoomStatus.valueOf(request.getStatus()));
        } else
        {
            room.setStatus(Room.RoomStatus.AVAILABLE);
        }

        room = roomRepository.save(room);

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .size(room.getSize())
                .category(room.getCategory().name())
                .status(room.getStatus().name())
                .build();
    }

    @Override
    public void deleteRoom(Integer id)
    {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với ID: " + id));

        if ("OCCUPIED".equals(room.getStatus().name()))
        {
            throw new BusinessException("Không thể xóa phòng đang có khách hát!");
        }

        try
        {
            roomRepository.delete(room);
        } catch (Exception e)
        {
            throw new BusinessException("Không thể xóa phòng này vì đã có lịch sử hoạt động. Vui lòng chuyển trạng thái sang MAINTENANCE (Bảo trì).");
        }
    }

    @Override
    public RoomResponse updateRoom(Integer id, RoomRequest request)
    {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với ID: " + id));

        if (Room.RoomStatus.OCCUPIED.equals(room.getStatus()))
        {
            throw new BusinessException("Không thể chỉnh sửa thông tin khi phòng đang có khách hát!");
        }

        if (!room.getName().equals(request.getName()) && roomRepository.existsByName(request.getName())) {
            throw new BusinessException("Tên phòng mới đã tồn tại!");
        }

        room.setName(request.getName());
        room.setSize(request.getSize());
        room.setCategory(Room.RoomCategory.valueOf(request.getCategory().toUpperCase()));
        room.setStatus(Room.RoomStatus.valueOf(request.getStatus().toUpperCase()));

        room = roomRepository.save(room);

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .size(room.getSize())
                .category(room.getCategory().name())
                .status(room.getStatus().name())
                .build();
    }

    @Override
    public Page<RoomResponse> findAvailableRooms(LocalDateTime start, LocalDateTime end, Pageable pageable)
    {
        if (start.isBefore(LocalDateTime.now()))
        {
            throw new BusinessException("Thời gian bắt đầu không được ở quá khứ");
        }
        if (end.isBefore(start.plusMinutes(30)))
        {
            throw new BusinessException("Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 30 phút");
        }

        Page<Room> roomPage = roomRepository.findAvailableRooms(start, end, pageable);

        return roomPage.map(room -> RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .size(room.getSize())
                .category(room.getCategory().name())
                .status(room.getStatus().name())
                .build());
    }
}
