import axios from 'axios';

export const convertJsonToTable = async (jsonString) => {
  const response = await axios.post('/convert', { jsonData: jsonString });
  return response.data;
};

export const validateJson = async (jsonString) => {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};
