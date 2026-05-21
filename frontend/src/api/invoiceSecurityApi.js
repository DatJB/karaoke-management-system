import axiosClient from './axiosClient';

const invoiceSecurityApi = {
    generateKeys: () => axiosClient.post('/invoices/security/generate-keys', {}, { responseType: 'blob' }),
    migrateInvoices: () => axiosClient.post('/invoices/security/migrate'),
    verifyChain: (page = 0) => axiosClient.get(`/invoices/security/verify?page=${page}&size=9`),
    recoverAmounts: (file, page = 0) => {
        const formData = new FormData();
        formData.append('privateKeyFile', file);
        return axiosClient.post(`/invoices/security/recover?page=${page}&size=9`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default invoiceSecurityApi;
