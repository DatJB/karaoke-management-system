package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.RoomEmployeeResponse;

import java.util.List;

public interface BookingRoomEmployeeService {
    List<RoomEmployeeResponse> getRoomEmployee(Integer roomId);
    void addEmployeeToRoom(Integer roomId, Integer employeeId);
    void removeEmployeeFromRoom(Integer roomId, Integer employeeId);
}
