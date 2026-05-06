package com.karaoke.backend.service;

import com.karaoke.backend.dto.response.PayrollDto;
import java.io.ByteArrayInputStream;
import java.util.List;

public interface ExcelExportService {
    ByteArrayInputStream exportPayrollsToExcel(List<PayrollDto> payrolls);
}
