import api from './axios';

export const getInvoices = async (params) => {
    const response = await api.get('/invoices', { params });
    return response.data;
};

export const getInvoiceDetail = async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
};

export const confirmPayment = async (id) => {
    const response = await api.patch(`/invoices/${id}/pay`);
    return response.data;
};

export const applyDiscount = async (id, discountPercent) => {
    const response = await api.put(`/invoices/${id}/discount-percent`, { discountPercent });
    return response.data;
};

export const applyDirectDiscount = async (id, discountAmount) => {
    const response = await api.put(`/invoices/${id}/discount`, { discountAmount });
    return response.data;
};
