package com.karaoke.backend.dto.response;

import com.karaoke.backend.entity.Room;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomResponse {
    private Integer id;
    private String name;
    private Integer size;
    private Room.RoomCategory category;
    private Room.RoomStatus status;
}
