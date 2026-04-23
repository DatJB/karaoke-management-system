package com.karaoke.backend.dto.request;

import com.karaoke.backend.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAccountRequest
{
    @NotBlank(message = "Tài khoản không được để trống")
    private String username;

    private String password;

    @NotNull(message = "Quyền không được để trống")
    private Account.Role role;

    private Account.AccountStatus status;
}
