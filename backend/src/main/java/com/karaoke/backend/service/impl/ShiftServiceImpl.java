package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.CreateShiftRequest;
import com.karaoke.backend.dto.request.UpdateShiftRequest;
import com.karaoke.backend.dto.response.ShiftResponse;
import com.karaoke.backend.entity.Shift;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.ShiftRepository;
import com.karaoke.backend.service.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftServiceImpl implements ShiftService
{
    private final ShiftRepository shiftRepository;

    @Override
    public List<ShiftResponse> getShifts()
    {
        return shiftRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ShiftResponse createShift(CreateShiftRequest request)
    {
        validateShiftTime(request.getStartTime(), request.getEndTime());

        Shift shift = Shift.builder()
                .name(request.getName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        return toResponse(shiftRepository.save(shift));
    }

    @Override
    @Transactional
    public ShiftResponse updateShift(Integer id, UpdateShiftRequest request)
    {
        Shift shift = getShift(id);
        validateShiftTime(request.getStartTime(), request.getEndTime());

        shift.setName(request.getName());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());

        return toResponse(shiftRepository.save(shift));
    }

    @Override
    @Transactional
    public void deleteShift(Integer id)
    {
        Shift shift = getShift(id);
        shiftRepository.delete(shift);
    }

    private Shift getShift(Integer id)
    {
        return shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay ca voi id = " + id));
    }

    private void validateShiftTime(LocalTime startTime, LocalTime endTime)
    {
        if (startTime.equals(endTime))
        {
            throw new IllegalArgumentException("Gio bat dau va gio ket thuc khong duoc trung nhau");
        }
    }

    private ShiftResponse toResponse(Shift shift)
    {
        if (shift == null)
        {
            return null;
        }

        return ShiftResponse.builder()
                .id(shift.getId())
                .name(shift.getName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .build();
    }
}
