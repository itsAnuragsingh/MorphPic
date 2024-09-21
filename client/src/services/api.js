import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/conversion/upload`, formData);
  return response.data;
};

export const convertFile = async (filename, outputFormat) => {
  const response = await axios.post(`${API_URL}/conversion/convert`, { filename, outputFormat });
  return response.data;
};

export const downloadFile = (filename) => {
  window.location.href = `${API_URL}/conversion/download/${filename}`;
};