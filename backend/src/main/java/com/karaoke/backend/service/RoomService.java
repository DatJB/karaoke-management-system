package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.RoomRequest;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.dto.response.RoomResponse;

import java.util.List;

public interface RoomService
{
    PageResponse<RoomResponse> getAllRooms(String categoryStr, String statusStr, Integer minSize, Integer maxSize, int page, int size);

    RoomResponse getRoomDetail(Integer roomId);

    RoomResponse createRoom(RoomRequest request);

    void deleteRoom(Integer id);

    RoomResponse updateRoom(Integer id, RoomRequest request);
}
