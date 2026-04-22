package com.karaoke.backend.dto.request;

import com.karaoke.backend.entity.Employee;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateEmployeeRequest
{
    @NotBlank(message = "Mã nhân viên không được để trống")
    private String code;

    @NotBlank(message = "Tên nhân viên không được để trống")
    private String name;

    private String phone;

    @DecimalMin(value = "0.0", inclusive = true, message = "Lương cơ bản phải >= 0")
    private BigDecimal baseSalary;

    @DecimalMin(value = "0.0", inclusive = true, message = "Lương theo giờ phải >= 0")
    private BigDecimal salaryPerHour;

    private Employee.EmployeeStatus status;

    private String avatarUrl;
}
