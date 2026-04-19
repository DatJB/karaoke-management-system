package com.karaoke.backend.dto.request;

import com.karaoke.backend.entity.Room;
import lombok.Data;

@Data
public class RoomRequest {
    private String name;
    private Integer size;
    private Room.RoomCategory category;
    private Room.RoomStatus status;
}
