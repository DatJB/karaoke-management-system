package com.karaoke.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorEnableRequest
{
    @NotBlank
    private String code;
}
