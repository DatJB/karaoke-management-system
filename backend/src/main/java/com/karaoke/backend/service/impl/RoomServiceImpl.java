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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService
{
    private final RoomRepository roomRepository;
    private final BookingRoomRepository bookingRoomRepository;
    private final RoomPriceRepository roomPriceRepository;
    private final RoomPriceSpecialRepository roomPriceSpecialRepository;

    @Override
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

        List<RoomResponse> rooms = roomPage.getContent().stream()
                .map(room -> RoomResponse.builder()
                        .id(room.getId())
                        .name(room.getName())
                        .size(room.getSize())
                        .category(room.getCategory().name())
                        .status(room.getStatus().name())
                        .build())
                .toList();

        return PageResponse.<RoomResponse>builder()
                .currentPage(page)
                .totalPages(roomPage.getTotalPages())
                .pageSize(size)
                .totalElements(roomPage.getTotalElements())
                .data(rooms)
                .build();
    }

    @Override
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

        if ("OCCUPIED".equals(room.getStatus().name())) {
            BookingRoom activeBR = bookingRoomRepository.findByRoomIdAndStatus(room.getId(), BookingRoom.BookingRoomStatus.PLAYING)
                    .orElse(null);

            if (activeBR != null) {
                builder.bookingRoomId(activeBR.getId())
                        .bookingId(activeBR.getBooking().getId())
                        .checkinTime(activeBR.getCheckinTime())
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

        return builder.build();
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
}
