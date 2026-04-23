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
