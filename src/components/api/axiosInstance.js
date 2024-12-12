// src/axiosInstance.js
import axios from 'axios';

// URL của API
const API_BASE_URL = 'https://koicaresystemapi.azurewebsites.net';

// Tạo một instance của Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm refreshToken gọi đến API `/api/User/RefreshToken` để lấy token mới
async function refreshToken() {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) throw new Error('Không tìm thấy refreshToken');

    // Gọi API refresh token
    const response = await axios.post(`${API_BASE_URL}/api/User/RefeshToken`, {
      accessToken: storedAccessToken,
      refreshToken: storedRefreshToken,
    });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

    // Lưu lại accessToken và refreshToken mới
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    return newAccessToken;
  } catch (error) {
    console.error('Lỗi khi refresh token:', error);
    throw error;
  }
}

// Thêm interceptor để tự động refresh token khi gặp lỗi 401
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Lấy token mới
        const newAccessToken = await refreshToken();

        // Cập nhật token mới vào header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Gửi lại yêu cầu ban đầu với token mới
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Lỗi khi gửi lại yêu cầu sau khi refresh token:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Thiết lập token ban đầu từ localStorage
const token = localStorage.getItem('accessToken');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default axiosInstance;
