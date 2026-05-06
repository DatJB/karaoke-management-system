package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.response.PayrollDto;
import com.karaoke.backend.service.ExcelExportService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportServiceImpl implements ExcelExportService {

    @Override
    public ByteArrayInputStream exportPayrollsToExcel(List<PayrollDto> payrolls) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Payrolls");

            // Header
            String[] headers = {"Mã NV", "Tên NV", "Chức vụ", "Lương cơ bản", "Số giờ làm", "Lương theo giờ", "Tổng thưởng", "Tổng phạt", "Thực nhận", "Trạng thái"};
            Row headerRow = sheet.createRow(0);

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }

            int rowIdx = 1;
            for (PayrollDto payroll : payrolls) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(payroll.employeeId());
                row.createCell(1).setCellValue(payroll.employeeName());
                row.createCell(2).setCellValue(payroll.role());
                row.createCell(3).setCellValue(payroll.baseSalary() != null ? payroll.baseSalary().doubleValue() : 0.0);
                row.createCell(4).setCellValue(payroll.totalWorkHours() != null ? payroll.totalWorkHours().doubleValue() : 0.0);
                row.createCell(5).setCellValue(payroll.salaryFromHours() != null ? payroll.salaryFromHours().doubleValue() : 0.0);
                row.createCell(6).setCellValue(payroll.totalBonus() != null ? payroll.totalBonus().doubleValue() : 0.0);
                row.createCell(7).setCellValue(payroll.totalPenalty() != null ? payroll.totalPenalty().doubleValue() : 0.0);
                row.createCell(8).setCellValue(payroll.totalSalary() != null ? payroll.totalSalary().doubleValue() : 0.0);
                row.createCell(9).setCellValue(payroll.status());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export data to Excel file: " + e.getMessage());
        }
    }
}
