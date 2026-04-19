import axiosClient from './axiosClient';

const employeeApi = {
    getAll() {
        return axiosClient.get('/employees');
    }
};

export default employeeApi;
