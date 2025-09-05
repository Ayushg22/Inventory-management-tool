import axios from "axios";

const API_URL = "https://inventory-api-78435570544.asia-south1.run.app/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Request interceptor: attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_URL}/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });
        const newAccessToken = res.data.access_token;
        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        logout();
        return Promise.reject(error);
      }
    }

    // Don't logout for 403 or other errors
    return Promise.reject(error);
  }
);

// Centralized logout
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};

export default axiosInstance;