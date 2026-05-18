package com.karaoke.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorVerifyRequest
{
    @NotBlank
    private String username;

    @NotBlank
    private String code;
}
