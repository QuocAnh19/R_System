import axios from "axios";

const API = "http://127.0.0.1:5000/api";

export const getRecommendation = async (data) => {
  const response = await axios.post(`${API}/recommend`, data);

  return response.data;
};
