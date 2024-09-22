import axios from 'axios';

const API_URL = 'https://morphify-api.vercel.app/api';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await axios.post(`${API_URL}/conversion/upload`, formData);
    return response.data;
  } catch (error) {
    console.error('Upload error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const convertFile = async (filename, outputFormat) => {
  try {
    const response = await axios.post(`${API_URL}/conversion/convert`, { filename, outputFormat });
    return response.data;
  } catch (error) {
    console.error('Conversion error:', error.response ? error.response.data : error.message);
    throw new Error(`Conversion failed: ${error.response ? error.response.data : error.message}`);
  }
};

export const downloadFile = (filename) => {
  window.location.href = `${API_URL}/conversion/download/${filename}`;
};