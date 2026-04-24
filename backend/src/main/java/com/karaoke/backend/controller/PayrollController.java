package com.karaoke.backend.controller;

import com.karaoke.backend.dto.EmployeePayrollDetailDto;
import com.karaoke.backend.dto.PayrollCalculationResultDto;
import com.karaoke.backend.dto.PayrollDto;
import com.karaoke.backend.dto.PayrollPeriodRequestDto;
import com.karaoke.backend.dto.response.ApiResponse;
import com.karaoke.backend.entity.PayrollPeriod;
import com.karaoke.backend.repository.AccountRepository;
import com.karaoke.backend.repository.EmployeeRepository;
import com.karaoke.backend.service.PayrollPeriodService;
import com.karaoke.backend.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollPeriodService payrollPeriodService;
    private final PayrollService payrollService;
    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final com.karaoke.backend.service.ExcelExportService excelExportService;

//    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
//    @GetMapping("/employees")
//    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEmployees() {
//        List<Map<String, Object>> employees = employeeRepository.findAllWithAccount().stream()
//                .map(e -> Map.<String, Object>of(
//                        "id", e.getId(),
//                        "name", e.getName() != null ? e.getName() : "",
//                        "role", e.getAccount() != null ? e.getAccount().getRole().name() : "STAFF"
//                ))
//                .collect(java.util.stream.Collectors.toList());
//        return ResponseEntity.ok(new ApiResponse<>("Success", employees));
//    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/payroll-periods")
    public ResponseEntity<ApiResponse<Page<PayrollPeriod>>> getAllPeriods(Pageable pageable) {
        return ResponseEntity.ok(new ApiResponse<>("Success", payrollPeriodService.getAllPeriods(pageable)));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/payroll-periods/{id}")
    public ResponseEntity<ApiResponse<PayrollPeriod>> getPeriodById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>("Success", payrollPeriodService.getPeriodById(id)));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PostMapping("/payroll-periods")
    public ResponseEntity<ApiResponse<PayrollPeriod>> createPeriod(@Valid @RequestBody PayrollPeriodRequestDto request) {
        PayrollPeriod period = payrollPeriodService.createPeriod(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>("Period created successfully", period));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PatchMapping("/payroll-periods/{id}/status")
    public ResponseEntity<ApiResponse<PayrollPeriod>> updateStatus(@PathVariable Integer id, @RequestParam PayrollPeriod.PayrollPeriodStatus status) {
        PayrollPeriod period = payrollPeriodService.updatePeriodStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>("Status updated", period));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @DeleteMapping("/payroll-periods/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePeriod(@PathVariable Integer id) {
        payrollPeriodService.deletePeriod(id);
        return ResponseEntity.ok(new ApiResponse<>("Period deleted", null));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PostMapping("/payroll-periods/{id}/calculate")
    public ResponseEntity<ApiResponse<PayrollCalculationResultDto>> calculatePayroll(@PathVariable Integer id) {
        PayrollCalculationResultDto result = payrollService.calculatePayroll(id);
        return ResponseEntity.ok(new ApiResponse<>(result.message(), result));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/payroll-periods/{id}/payrolls")
    public ResponseEntity<ApiResponse<Page<PayrollDto>>> getPayrolls(@PathVariable Integer id, Pageable pageable) {
        Page<PayrollDto> payrolls = payrollPeriodService.getPayrollsByPeriod(id, pageable);
        return ResponseEntity.ok(new ApiResponse<>("Success", payrolls));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/payroll-periods/{periodId}/payrolls/{payrollId}")
    public ResponseEntity<ApiResponse<PayrollDto>> updatePayroll(
            @PathVariable Integer periodId, 
            @PathVariable Integer payrollId, 
            @RequestBody com.karaoke.backend.dto.PayrollUpdateRequestDto request) {
        PayrollDto updated = payrollPeriodService.updatePayroll(periodId, payrollId, request);
        return ResponseEntity.ok(new ApiResponse<>("Payroll updated", updated));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/payrolls/export")
    public ResponseEntity<org.springframework.core.io.Resource> exportPayrolls(@RequestParam Integer periodId) {
        java.util.List<PayrollDto> payrolls = payrollPeriodService.getAllPayrollsByPeriodForExport(periodId);
        java.io.ByteArrayInputStream in = excelExportService.exportPayrollsToExcel(payrolls);

        org.springframework.core.io.InputStreamResource resource = new org.springframework.core.io.InputStreamResource(in);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=payrolls_period_" + periodId + ".xlsx")
                .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/payroll-periods/{periodId}/payrolls/{employeeId}/details")
    public ResponseEntity<ApiResponse<EmployeePayrollDetailDto>> getEmployeeDetails(@PathVariable Integer periodId, @PathVariable Integer employeeId) {
        EmployeePayrollDetailDto details = payrollPeriodService.getEmployeePayrollDetails(periodId, employeeId);
        return ResponseEntity.ok(new ApiResponse<>("Success", details));
    }

    @PreAuthorize("hasAnyRole('STAFF', 'RECEPTIONIST')")
    @GetMapping("/payroll-periods/{periodId}/payrolls/me/details")
    public ResponseEntity<ApiResponse<EmployeePayrollDetailDto>> getMyEmployeeDetails(@PathVariable Integer periodId) {
        Integer employeeId = getCurrentEmployeeId();
        EmployeePayrollDetailDto details = payrollPeriodService.getEmployeePayrollDetails(periodId, employeeId);
        return ResponseEntity.ok(new ApiResponse<>("Success", details));
    }

    @PreAuthorize("hasAnyRole('STAFF', 'RECEPTIONIST')")
    @GetMapping("/payroll/me")
    public ResponseEntity<ApiResponse<Page<PayrollDto>>> getMyPayrolls(Pageable pageable) {
        Integer employeeId = getCurrentEmployeeId();
        Page<PayrollDto> payrolls = payrollPeriodService.getMyPayrolls(employeeId, pageable);
        return ResponseEntity.ok(new ApiResponse<>("Success", payrolls));
    }

    private Integer getCurrentEmployeeId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return accountRepository.findByUsername(username)
                .map(account -> account.getEmployee().getId())
                .orElseThrow(() -> new IllegalArgumentException("Employee account not found for current user"));
    }
}
