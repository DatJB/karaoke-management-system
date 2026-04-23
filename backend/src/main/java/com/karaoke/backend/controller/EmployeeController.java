package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.CreateEmployeeRequest;
import com.karaoke.backend.dto.request.UpdateEmployeeRequest;
import com.karaoke.backend.dto.response.EmployeeResponse;
import com.karaoke.backend.dto.response.NewPageResponse;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/employees")
public class EmployeeController
{
    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'MANAGER', 'ADMIN')")
    public ResponseEntity<NewPageResponse<EmployeeResponse>> getEmployees(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String role)
    {
        NewPageResponse<EmployeeResponse> response = employeeService.getEmployees(page, size, search, role);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public EmployeeResponse createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request
    ) {
        return employeeService.createEmployee(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public EmployeeResponse updateEmployee(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateEmployeeRequest request
    ) {
        return employeeService.updateEmployee(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public Map<String, String> deleteEmployee(
            @PathVariable Integer id
    ) {
        employeeService.deleteEmployee(id);
        return Map.of("message", "Xóa nhân viên thành công");
    }
}
