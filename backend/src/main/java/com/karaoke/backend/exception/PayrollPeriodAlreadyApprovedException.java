package com.karaoke.backend.exception;

/**
 * Exception thrown when attempting to recalculate a payroll period that is no longer in DRAFT status.
 */
public class PayrollPeriodAlreadyApprovedException extends RuntimeException {
    public PayrollPeriodAlreadyApprovedException(String message) {
        super(message);
    }
}
