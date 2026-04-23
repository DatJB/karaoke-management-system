package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.CreateEmployeeRequest;
import com.karaoke.backend.dto.request.UpdateEmployeeRequest;
import com.karaoke.backend.dto.response.EmployeeResponse;
import com.karaoke.backend.dto.response.NewPageResponse;
import com.karaoke.backend.dto.response.PageResponse;

public interface EmployeeService
{
    NewPageResponse<EmployeeResponse> getEmployees(int page, int size, String search, String roleStr);

    EmployeeResponse createEmployee(CreateEmployeeRequest request);

    EmployeeResponse updateEmployee(Integer id, UpdateEmployeeRequest request);

    void deleteEmployee(Integer id);
}
