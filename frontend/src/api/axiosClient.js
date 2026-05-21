import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request
axiosClient.interceptors.request.use(
    (config) => {
        // JWT 
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response
axiosClient.interceptors.response.use(
    (response) => {
        if (response.data && response.data.data !== undefined) {
            return response.data;
        }
        return response.data;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const backendMessage = error.response.data?.message;

            switch (status) {
                case 401:
                    console.error('Unauthorized! Token might be expired.');
                    break;
                case 403:
                    console.error('Forbidden! You lack permissions.');
                    break;
                case 404:
                    console.error('Resource not found.');
                    break;
                case 409:
                    console.warn('Conflict / Business Error:', backendMessage);
                    break;
                default:
                    console.error('Server error:', backendMessage || error.message);
            }
            return Promise.reject(new Error(backendMessage || 'An unexpected error occurred.'));
        } else if (error.request) {
            console.error('Network Error: No response received from the server.');
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
