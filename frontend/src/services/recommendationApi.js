import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export const getRecommendation = async (data) => {
  const response = await axios.post(`${API}/recommend`, data);
  return response.data;
};

export const getCareers = async () => {
  const response = await axios.get(`${API}/careers`);
  return response.data;
};

export const getSkillsByCareer = async (careerName) => {
  const response = await axios.get(
    `${API}/skills/${encodeURIComponent(careerName)}`,
  );
  return response.data;
};
