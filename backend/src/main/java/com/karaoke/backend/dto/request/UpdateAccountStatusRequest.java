package com.karaoke.backend.dto.request;

import com.karaoke.backend.entity.Account;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAccountStatusRequest
{
    @NotNull(message = "Trạng thái không được để trống")
    private Account.AccountStatus status;
}
