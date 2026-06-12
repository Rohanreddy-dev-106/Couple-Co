import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true, // Crucial for cookie-based JWT sessions
});

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    // If the request succeeds, simply return the response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 Unauthorized, and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark the request as retried so we don't get stuck in an infinite loop
      originalRequest._retry = true;

      // Special case: If the request that failed was the login or refresh endpoint itself,
      // don't try to refresh, just reject.
      if (originalRequest.url.includes("/user/login") || originalRequest.url.includes("/user/refresh-Token")) {
        return Promise.reject(error);
      }

      try {
        // Attempt to call the refresh token endpoint
        // Using axios.post directly to avoid triggering this interceptor again
        await axios.post(
          `${api.defaults.baseURL}/user/refresh-Token`,
          {},
          { withCredentials: true }
        );

        // If the refresh succeeded, the backend has set a new jwtToken cookie.
        // We can now safely retry the original request.
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh token request fails (e.g., refresh token is expired or invalid),
        // redirect the user to the login page
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    // For all other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default api;
