package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.ServingRoomResponse;
import java.util.List;

public interface MeService {
    List<ServingRoomResponse> getServingRooms(String username);
}
