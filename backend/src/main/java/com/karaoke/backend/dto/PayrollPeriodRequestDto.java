package com.karaoke.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record PayrollPeriodRequestDto(
        @NotBlank(message = "Name cannot be empty")
        String name,
        
        @NotNull(message = "Period start date is required")
        LocalDate periodStart,
        
        @NotNull(message = "Period end date is required")
        LocalDate periodEnd
) {}
