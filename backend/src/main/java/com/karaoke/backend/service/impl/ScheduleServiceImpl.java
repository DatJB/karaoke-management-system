package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.CreateScheduleRequest;
import com.karaoke.backend.dto.request.DeleteScheduleRequest;
import com.karaoke.backend.dto.response.ScheduleResponse;
import com.karaoke.backend.entity.Employee;
import com.karaoke.backend.entity.EmployeeShift;
import com.karaoke.backend.entity.Shift;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.AccountRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.repository.EmployeeShiftRepository;
import com.karaoke.backend.repository.ShiftRepository;
import com.karaoke.backend.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService
{
    private final EmployeeShiftRepository employeeShiftRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;
    private final AccountRepository accountRepository;

    @Override
    public List<ScheduleResponse> getSchedules(LocalDate fromDate, LocalDate toDate)
    {
        return employeeShiftRepository.findSchedules(fromDate, toDate).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ScheduleResponse createSchedule(CreateScheduleRequest request)
    {
        if (employeeShiftRepository.existsByEmployeeIdAndShiftIdAndWorkDate(
                request.getEmployeeId(), request.getShiftId(), request.getWorkDate())
        ) {
            throw new IllegalArgumentException("Nhan vien da duoc phan vao ca nay trong ngay da chon");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay nhan vien voi id = " + request.getEmployeeId()));

        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay ca voi id = " + request.getShiftId()));

        EmployeeShift schedule = EmployeeShift.builder()
                .employee(employee)
                .shift(shift)
                .workDate(request.getWorkDate())
                .note(request.getNote())
                .build();

        return toResponse(employeeShiftRepository.save(schedule));
    }

    @Override
    @Transactional
    public void deleteSchedule(DeleteScheduleRequest request)
    {
        EmployeeShift schedule = employeeShiftRepository
                .findByEmployeeIdAndShiftIdAndWorkDate(request.getEmployeeId(), request.getShiftId(), request.getWorkDate())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay phan cong can xoa"));

        employeeShiftRepository.delete(schedule);
    }

    @Override
    public List<ScheduleResponse> getMySchedules(LocalDate fromDate, LocalDate toDate)
    {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Integer employeeId = accountRepository.findByUsername(username)
                .map(account -> account.getEmployee() != null ? account.getEmployee().getId() : null)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay tai khoan dang nhap"));

        if (employeeId == null)
        {
            throw new ResourceNotFoundException("Tai khoan hien tai khong lien ket nhan vien");
        }

        return employeeShiftRepository.findSchedulesByEmployee(employeeId, fromDate, toDate).stream()
                .map(this::toResponse)
                .toList();
    }

    private ScheduleResponse toResponse(EmployeeShift schedule)
    {
        if (schedule == null)
        {
            return null;
        }

        Employee employee = schedule.getEmployee();
        Shift shift = schedule.getShift();

        return ScheduleResponse.builder()
                .id(schedule.getId())
                .workDate(schedule.getWorkDate())
                .note(schedule.getNote())
                .employeeId(employee != null ? employee.getId() : null)
                .employeeName(employee != null ? employee.getName() : null)
                .employeeCode(employee != null ? employee.getCode() : null)
                .shiftId(shift != null ? shift.getId() : null)
                .shiftName(shift != null ? shift.getName() : null)
                .shiftStartTime(shift != null ? shift.getStartTime() : null)
                .shiftEndTime(shift != null ? shift.getEndTime() : null)
                .build();
    }
}
