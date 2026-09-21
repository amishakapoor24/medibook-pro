import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// Attach access token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh token on 401
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          { refreshToken }
        );
        localStorage.setItem("accessToken", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  verifyOTP: (data) => API.post("/auth/verify-otp", data),
  resendOTP: (data) => API.post("/auth/resend-otp", data),
  login: (data) => API.post("/auth/login", data),
  googleAuth: (data) => API.post("/auth/google", data),
  forgotPassword: (data) => API.post("/auth/forgot-password", data),
  resetPassword: (data) => API.post("/auth/reset-password", data),
  getMe: () => API.get("/auth/me"),
  logout: () => API.post("/auth/logout"),
  refreshToken: (data) => API.post("/auth/refresh", data),
};

// Doctors
export const doctorAPI = {
  getAll: (params) => API.get("/doctors", { params }),
  getById: (id) => API.get(`/doctors/${id}`),
  updateProfile: (data) => API.put("/doctors/profile", data),
  uploadPhoto: (data) => API.put("/doctors/profile/photo", data),
  uploadDocument: (data) => API.put("/doctors/documents", data),
  getNotifications: () => API.get("/doctors/notifications/all"),
  markNotificationRead: (id) => API.put(`/doctors/notifications/${id}`),
};

// Appointments
export const appointmentAPI = {
  book: (data) => API.post("/appointments", data),
  getMyAppointments: (params) => API.get("/appointments/my", { params }),
  getDoctorAppointments: (params) => API.get("/appointments/doctor", { params }),
  getById: (id) => API.get(`/appointments/${id}`),
  accept: (id, data) => API.put(`/appointments/${id}/accept`, data),
  reject: (id, data) => API.put(`/appointments/${id}/reject`, data),
  cancel: (id) => API.put(`/appointments/${id}/cancel`),
  complete: (id, data) => API.put(`/appointments/${id}/complete`, data),
};

// Admin
export const adminAPI = {
  getAnalytics: () => API.get("/admin/analytics"),
  getPendingDoctors: () => API.get("/admin/doctors/pending"),
  getAllDoctors: () => API.get("/admin/doctors"),
  approveDoctor: (id) => API.put(`/admin/doctors/${id}/approve`),
  rejectDoctor: (id, data) => API.put(`/admin/doctors/${id}/reject`, data),
  toggleUserStatus: (id, data) => API.put(`/admin/users/${id}/toggle`, data),
  getAllPatients: () => API.get("/admin/patients"),
  getAllAppointments: () => API.get("/admin/appointments"),
};

// Chat
export const chatAPI = {
  getMessages: (appointmentId) => API.get(`/chat/${appointmentId}`),
  sendMessage: (appointmentId, data) => API.post(`/chat/${appointmentId}`, data),
};

export const assistantAPI = {
  chat: (messages) => API.post("/assistant/chat", { messages }),
};
