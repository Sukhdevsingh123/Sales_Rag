import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ Auth APIs ============

export const login = async (email, password) => {
  const response = await API.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

// ============ User Management APIs (Admin only) ============

export const createUser = async (email, fullName, password, role = "user") => {
  const response = await API.post("/auth/users", {
    email,
    full_name: fullName,
    password,
    role,
  });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await API.get("/auth/users");
  return response.data;
};

export const updateUser = async (userId, updates) => {
  const response = await API.put(`/auth/users/${userId}`, updates);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await API.delete(`/auth/users/${userId}`);
  return response.data;
};

// ============ Upload APIs (Admin/Test only) ============

export const uploadPDF = async (file, skipImages = false) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("skip_images", skipImages);

  const response = await API.post(
    "/upload/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ============ RAG APIs (Authenticated users) ============

export const askQuestion = async (question) => {
  const response = await API.post(
    "/rag/ask",
    {
      question,
    }
  );

  return response.data;
};

export default API;