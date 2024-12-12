
import axios from "axios";

const baseUrl = "https://koicaresystemapi.azurewebsites.net/api/";

const config = {
  baseURL: baseUrl, 
};

const api = axios.create(config);

api.defaults.baseURL = baseUrl;


const handleBefore = (config) => {

  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"];
  }
  return config;
};

api.interceptors.request.use(handleBefore, null);

export default api;