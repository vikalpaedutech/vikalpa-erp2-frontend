import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url.includes("/auth/refresh-token") ||
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = apiClient
          .post("/auth/refresh-token")
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;

      return apiClient(originalRequest);
    } catch (refreshError) {
      window.dispatchEvent(new Event("auth:session-expired"));

      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;