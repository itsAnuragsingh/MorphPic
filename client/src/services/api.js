import axios from 'axios';

const API_BASE_URL = 'https://morphify-api.vercel.app/api'; // Change this to use relative URL for API routes

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE_URL}/upload`, formData);
  return response.data;
};

export const convertFile = async (filename, format) => {
  const response = await axios.post(`${API_BASE_URL}/convert`, { filename, format });
  return response.data;
};

export const downloadFile = async (filename) => {
  const response = await axios.get(`${API_BASE_URL}/download/${filename}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const deleteFiles = async (originalFilename, convertedFilename) => {
  const response = await axios.post(`${API_BASE_URL}/delete`, { originalFilename, convertedFilename });
  return response.data;
};
