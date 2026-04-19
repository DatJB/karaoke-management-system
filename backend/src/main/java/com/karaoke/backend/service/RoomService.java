package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.RoomRequest;
import com.karaoke.backend.dto.response.RoomResponse;

import java.util.List;

public interface RoomService {
    List<RoomResponse> getAllRooms();
    RoomResponse getRoomById(Integer id);
    RoomResponse createRoom(RoomRequest request);
    RoomResponse updateRoom(Integer id, RoomRequest request);
    void deleteRoom(Integer id);
}
