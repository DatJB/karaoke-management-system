package com.karaoke.backend.dto.response;

import com.karaoke.backend.entity.Account;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AccountResponse
{
    private Integer id;
    private String username;
    private Account.Role role;
    private Account.AccountStatus status;
    private Integer employeeId;
    private String employeeName;
}
