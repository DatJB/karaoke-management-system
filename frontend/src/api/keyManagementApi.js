import axiosClient from './axiosClient';

const keyManagementApi = {
    splitUpload: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/security/keys/split-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    restore: (shares) => {
        return axiosClient.post('/security/keys/restore', { shares }, { responseType: 'blob' });
    }
};

export default keyManagementApi;
