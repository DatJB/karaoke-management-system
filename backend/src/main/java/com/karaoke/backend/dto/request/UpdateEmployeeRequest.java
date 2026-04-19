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
    private String code;

    @NotBlank(message = "Ten nhan vien khong duoc de trong")
    private String name;

    private String phone;

    @DecimalMin(value = "0.0", inclusive = true, message = "Luong co ban phai >= 0")
    private BigDecimal baseSalary;

    @NotNull(message = "Luong theo gio khong duoc de trong")
    @DecimalMin(value = "0.0", inclusive = false, message = "Luong theo gio phai > 0")
    private BigDecimal salaryPerHour;

    private Employee.EmployeeStatus status;

    private String avatarUrl;
}
