import axiosClient from './axiosClient';

const payrollPeriodApi = {
    /**
     * Retrieve paginated payroll periods
     */
    getPeriods(page = 0, size = 10) {
        return axiosClient.get('/payroll-periods', {
            params: { page, size }
        });
    },

    /**
     * Create a new payroll period
     */
    createPeriod(data) {
        // data should match PayrollPeriodRequestDto: { name, periodStart, periodEnd }
        return axiosClient.post('/payroll-periods', data);
    },

    /**
     * Update the status of a payroll period
     */
    updateStatus(id, status) {
        // Valid statuses: DRAFT, APPROVED, PAID
        return axiosClient.patch(`/payroll-periods/${id}/status`, null, {
            params: { status }
        });
    },

    /**
     * Trigger backend to calculate payrolls for a specific period
     */
    calculatePayroll(id) {
        return axiosClient.post(`/payroll-periods/${id}/calculate`);
    },

    /**
     * Delete a payroll period (only allowed if status is DRAFT)
     */
    deletePeriod(id) {
        return axiosClient.delete(`/payroll-periods/${id}`);
    },

    /**
     * Retrieve all payrolls within a specific period (Pagination)
     */
    getPayrollsByPeriod(id, page = 0, size = 10) {
        return axiosClient.get(`/payroll-periods/${id}/payrolls`, {
            params: { page, size }
        });
    },

    /**
     * Deep-dive: Get specific employee's combined service history and penalties
     */
    getPeriodDetails(periodId, employeeId) {
        return axiosClient.get(`/payroll-periods/${periodId}/payrolls/${employeeId}/details`);
    },

    /**
     * Update a specific payroll manually
     */
    updatePayroll(periodId, payrollId, data) {
        return axiosClient.put(`/payroll-periods/${periodId}/payrolls/${payrollId}`, data);
    },

    /**
     * Export payrolls to excel for a specific period
     */
    exportPayrolls(periodId) {
        return axiosClient.get(`/payrolls/export`, {
            params: { periodId },
            responseType: 'blob'
        });
    },

    /**
     * Get my own payrolls (Staff/Receptionist)
     */
    getMyPayrolls(page = 0, size = 10) {
        return axiosClient.get('/payroll/me', {
            params: { page, size }
        });
    }
};

export default payrollPeriodApi;
