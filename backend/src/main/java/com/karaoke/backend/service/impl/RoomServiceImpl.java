package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.RoomRequest;
import com.karaoke.backend.dto.response.RoomResponse;
import com.karaoke.backend.entity.Room;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.RoomRepository;
import com.karaoke.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return mapToResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Room room = Room.builder()
                .name(request.getName())
                .size(request.getSize())
                .category(request.getCategory())
                .status(request.getStatus() != null ? request.getStatus() : Room.RoomStatus.AVAILABLE)
                .build();
        return mapToResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Integer id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        room.setName(request.getName());
        room.setSize(request.getSize());
        room.setCategory(request.getCategory());
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }

        return mapToResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void deleteRoom(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        
        // Tránh xóa phòng đang có khách hoặc có lịch đặt
        if (room.getStatus() != Room.RoomStatus.AVAILABLE && room.getStatus() != Room.RoomStatus.MAINTENANCE) {
             throw new IllegalStateException("Không thể xóa phòng đang có khách hoặc đang được đặt.");
        }

        roomRepository.delete(room);
    }

    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .size(room.getSize())
                .category(room.getCategory())
                .status(room.getStatus())
                .build();
    }
}
