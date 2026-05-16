package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.CreateShiftRequest;
import com.karaoke.backend.dto.request.UpdateShiftRequest;
import com.karaoke.backend.dto.response.ShiftResponse;

import java.util.List;

public interface ShiftService
{
    List<ShiftResponse> getShifts();

    ShiftResponse createShift(CreateShiftRequest request);

    ShiftResponse updateShift(Integer id, UpdateShiftRequest request);

    void deleteShift(Integer id);
}
