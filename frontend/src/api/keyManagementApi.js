import axiosClient from './axiosClient';

const keyManagementApi = {
    splitUpload: (file, managerUsernames) => {
        const formData = new FormData();
        formData.append('file', file);
        managerUsernames.forEach(username => {
            formData.append('managerUsernames', username);
        });
        return axiosClient.post('/security/keys/split-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    restore: (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        return axiosClient.post('/security/keys/restore', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob'
        });
    },
    claimShare: (otpCode, username) => {
        return axiosClient.post('/security/keys/claim-share', { otpCode, username }, { responseType: 'blob' });
    },
    getActiveDistribution: () => {
        return axiosClient.get('/security/keys/active-distribution');
    },
    endDistribution: () => {
        return axiosClient.post('/security/keys/end-distribution');
    },
    startRecovery: () => {
        return axiosClient.post('/security/keys/start-recovery');
    },
    endRecovery: () => {
        return axiosClient.post('/security/keys/end-recovery');
    },
    getActiveRecovery: () => {
        return axiosClient.get('/security/keys/active-recovery');
    },
    uploadRecoveryShares: (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        return axiosClient.post('/security/keys/upload-recovery-shares', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    executeCollaborativeRecovery: () => {
        return axiosClient.post('/security/keys/execute-collaborative-recovery');
    },
    downloadRestoredKey: () => {
        return axiosClient.get('/security/keys/download-restored-key', {
            responseType: 'blob'
        });
    },
    deleteRecoveryShare: (x) => {
        return axiosClient.delete(`/security/keys/recovery-shares/${x}`);
    }
};

export default keyManagementApi;
