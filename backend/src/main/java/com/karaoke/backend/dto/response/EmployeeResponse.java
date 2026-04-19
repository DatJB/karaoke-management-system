package com.karaoke.backend.dto.response;

import com.karaoke.backend.entity.Account;
import com.karaoke.backend.entity.Employee;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class EmployeeResponse
{
    private Integer id;
    private String code;
    private String name;
    private String phone;
    private BigDecimal baseSalary;
    private BigDecimal salaryPerHour;
    private Employee.EmployeeStatus status;
    private String avatarUrl;
    private Integer accountId;
    private String username;
    private Account.Role role;
    private Account.AccountStatus accountStatus;
}
