package com.karaoke.backend.service;

public interface BookingRoomEmployeeService {
    void addEmployeeToRoom(Integer roomId, Integer employeeId);
    void removeEmployeeFromRoom(Integer roomId, Integer employeeId);
}
