package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomStaffResponse
{
    private Integer id;
    private String code;
    private String name;
}
