import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const httpClient = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 请求拦截器
httpClient.interceptors.request.use(
    (config) => {
        const authData = localStorage.getItem('auth');
        if (authData) {
            const { token } = JSON.parse(authData);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
httpClient.interceptors.response.use(
    (response) => {
        if (response.config.responseType === 'blob') {
            return response;
        }
        return response.data;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            switch (status) {
                case 401:
                    localStorage.removeItem('auth');
                    window.location.href = '/login';
                    break;
                default:
                    console.error('API Error:', data);
            }
        }
        return Promise.reject(error);
    }
);