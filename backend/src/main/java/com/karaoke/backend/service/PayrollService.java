package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.PayrollCalculationResultDto;

public interface PayrollService {
    PayrollCalculationResultDto calculatePayroll(Integer periodId);
}
