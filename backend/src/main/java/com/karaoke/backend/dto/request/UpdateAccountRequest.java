package com.karaoke.backend.dto.request;

import com.karaoke.backend.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAccountRequest
{
    @NotBlank(message = "Username khong duoc de trong")
    private String username;

    private String password;

    @NotNull(message = "Role khong duoc de trong")
    private Account.Role role;

    private Account.AccountStatus status;
}
