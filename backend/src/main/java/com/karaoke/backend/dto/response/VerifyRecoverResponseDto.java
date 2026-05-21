package com.karaoke.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VerifyRecoverResponseDto {
    private List<InvoiceRecoveryReportDto> content;
    private int number;
    private int totalPages;
    private long totalElements;
    private boolean hasMismatch;
    private boolean hasDecFailed;
}
