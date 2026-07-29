import axios from 'axios';
import { socket } from '../socket';
const api = axios.create({
    baseURL: 'http://localhost:5000/',
    withCredentials: true
})


api.interceptors.response.use((response) => {
    return response;
},
    async (error) => {
        //console.log(error.config);
        const originalRequest = error.config;
        const isAlreadyRefresh = originalRequest.url.includes('/auth/refresh')
        if (error.response.status === 401 && !originalRequest.retry && !isAlreadyRefresh) {
            socket.disconnect();
            originalRequest.retry = true;
            //accessToken was missing. So, refresh endpoint will generate new accessToken
            try {

                await api.post('auth/refresh');
                return api(originalRequest);
            } catch (refreshErr) {
                return Promise.reject(error);
            }

        }

        return Promise.reject(error)
    }
)

export default api;