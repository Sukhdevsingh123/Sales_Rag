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

// export const askQuestion = async (question) => {
//   const response = await API.post(
//     "/rag/ask",
//     {
//       question,
//     }
//   );

//   return response.data;
// };




export const askQuestion = async (
  question,
  onChunk,
  onSources
) => {

  const token =
    localStorage.getItem("token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/rag/ask`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`
      },

      body: JSON.stringify({
        question
      })
    }
  );

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  while (true) {

    const {
      done,
      value
    } = await reader.read();

    if (done) break;

    const chunk =
      decoder.decode(value);

    const lines =
      chunk.split("\n");

    for (const line of lines) {

      if (!line.trim())
        continue;

      try {

        const data =
          JSON.parse(line);

        if (
          data.type ===
          "token"
        ) {

          onChunk(
            data.content
          );
        }

        if (
          data.type ===
          "sources"
        ) {

          onSources(
            data.sources
          );
        }

      } catch (err) {

        console.log(
          "Parse Error:",
          err
        );
      }
    }
  }
};

export default API;