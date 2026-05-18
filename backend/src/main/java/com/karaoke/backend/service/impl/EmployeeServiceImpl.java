package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.CreateEmployeeRequest;
import com.karaoke.backend.dto.request.UpdateEmployeeRequest;
import com.karaoke.backend.dto.response.EmployeeResponse;
import com.karaoke.backend.dto.response.NewPageResponse;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.entity.Account;
import com.karaoke.backend.entity.Employee;
import com.karaoke.backend.exception.BusinessException;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.AccountRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.service.CloudinaryService;
import com.karaoke.backend.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService
{
    private final EmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    @Override
    public NewPageResponse<EmployeeResponse> getEmployees(int page, int size, String search, String roleStr)
    {
        Account.Role roleEnum = null;
        if (roleStr != null && !roleStr.trim().isEmpty())
        {
            try {
                roleEnum = Account.Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e)
            {
                throw new BusinessException("Phân quyền không hợp lệ!");
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "code"));
        Page<EmployeeResponse> employeePage = employeeRepository.searchEmployees(search, roleEnum, pageable)
                .map(this::toResponse);

        return NewPageResponse.from(employeePage);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest request, MultipartFile avatarFile) throws IOException
    {
        validateEmployeeCode(request.getCode(), null);
        validateUsername(request.getUsername(), null);

        String uploadedAvatarUrl = null;
        if (avatarFile != null && !avatarFile.isEmpty())
        {
            uploadedAvatarUrl = cloudinaryService.uploadImage(avatarFile);
        }

        Employee employee = Employee.builder()
                .code(request.getCode())
                .name(request.getName())
                .phone(request.getPhone())
                .baseSalary(defaultIfNull(request.getBaseSalary()))
                .salaryPerHour(request.getSalaryPerHour())
                .status(request.getStatus() == null ? Employee.EmployeeStatus.AVAILABLE : request.getStatus())
                .build();
        employeeRepository.save(employee);

        Account account = Account.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(request.getAccountStatus() == null ? Account.AccountStatus.ACTIVE : request.getAccountStatus())
                .avatarUrl(uploadedAvatarUrl)
                .employee(employee)
                .build();
        accountRepository.save(account);

        employee.setAccount(account);
        return toResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Integer id, UpdateEmployeeRequest request)
    {
        Employee employee = getEmployee(id);
        validateEmployeeCode(request.getCode(), id);

        employee.setCode(request.getCode());
        employee.setName(request.getName());
        employee.setPhone(request.getPhone());
        employee.setBaseSalary(defaultIfNull(request.getBaseSalary()));
        employee.setSalaryPerHour(request.getSalaryPerHour());
        employee.setStatus(request.getStatus() == null ? employee.getStatus() : request.getStatus());
        employee.setAvatarUrl(request.getAvatarUrl());

        return toResponse(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public void deleteEmployee(Integer id)
    {
        Employee employee = getEmployee(id);

        if (employee.getAccount() != null)
        {
            accountRepository.delete(employee.getAccount());
        }

        employeeRepository.delete(employee);
    }

    private Employee getEmployee(Integer id)
    {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với id = " + id));
    }

    private void validateEmployeeCode(String code, Integer employeeId)
    {
        if (code == null || code.isBlank())
        {
            return;
        }

        boolean exists = employeeId == null
                ? employeeRepository.existsByCode(code)
                : employeeRepository.existsByCodeAndIdNot(code, employeeId);

        if (exists)
        {
            throw new IllegalArgumentException("Mã nhân viên đã tồn tại");
        }
    }

    private void validateUsername(String username, Integer accountId)
    {
        boolean exists = accountId == null
                ? accountRepository.existsByUsername(username)
                : accountRepository.existsByUsernameAndIdNot(username, accountId);

        if (exists)
        {
            throw new IllegalArgumentException("Tài khoản đã tồn tại");
        }
    }

    private BigDecimal defaultIfNull(BigDecimal value)
    {
        return value == null ? BigDecimal.ZERO : value;
    }

    private EmployeeResponse toResponse(Employee employee)
    {
        if (employee == null)
        {
            return null;
        }

        Account account = employee.getAccount();
        String avatarUrl = account != null && account.getAvatarUrl() != null
                ? account.getAvatarUrl()
                : employee.getAvatarUrl();

        return EmployeeResponse.builder()
                .id(employee.getId())
                .code(employee.getCode())
                .name(employee.getName())
                .phone(employee.getPhone())
                .baseSalary(employee.getBaseSalary())
                .salaryPerHour(employee.getSalaryPerHour())
                .status(employee.getStatus())
                .avatarUrl(avatarUrl)
                .accountId(account != null ? account.getId() : null)
                .username(account != null ? account.getUsername() : null)
                .role(account != null ? account.getRole() : null)
                .accountStatus(account != null ? account.getStatus() : null)
                .build();
    }
}
