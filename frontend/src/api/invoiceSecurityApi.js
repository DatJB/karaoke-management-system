import axiosClient from './axiosClient';

const invoiceSecurityApi = {
    generateKeys: () => axiosClient.post('/invoices/security/generate-keys', {}, { responseType: 'blob' }),
    migrateInvoices: () => axiosClient.post('/invoices/security/migrate'),
    verifyChain: () => axiosClient.get('/invoices/security/verify'),
    recoverAmounts: (file) => {
        const formData = new FormData();
        formData.append('privateKeyFile', file);
        return axiosClient.post('/invoices/security/recover', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default invoiceSecurityApi;
