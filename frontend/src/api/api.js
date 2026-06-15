import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const uploadPDF = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

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