//@ts-nocheck
import axios from "axios";
import i18n from "i18n";
import { API_URL } from "constants/constants";
import { getCookieFromBrowser, removeCookie } from "utils/session";
import { error as toastError } from "components/alert/toast";

const request = axios.create({
  baseURL: API_URL,
  // timeout: 16000,
});

request.interceptors.request.use(
  (config) => {
    const token = getCookieFromBrowser("access_token");
    const locale = i18n.language;
    
    // Log the outgoing request
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: {
        Authorization: token ? 'Bearer ' + token : undefined,
        'Content-Type': config.headers['Content-Type'],
      },
      params: config.params,
      data: config.data
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.params = { lang: locale, ...config.params };
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

function errorHandler(error) {
  console.log("Full error object:", error);
  
  if (error?.response) {
    // Log the complete error response
    console.log("Error response details:", {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      headers: error.response.headers,
      config: {
        url: error.response.config.url,
        method: error.response.config.method,
        data: error.response.config.data,
        params: error.response.config.params
      }
    });

    if (error.response.status === 403) {
      // Handle forbidden
      toastError(error.response.data?.message || i18n.t("forbidden"));
    } else if (error.response.status === 401) {
      toastError(i18n.t("unauthorized"), {
        toastId: "unauthorized",
      });
      removeCookie("user");
      removeCookie("access_token");
      window.location.replace("/login");
    } else if (error.response.status === 400) {
      // Handle validation errors
      const message = error.response.data?.message || 
                     (error.response.data?.errors && Object.values(error.response.data.errors).join(", ")) ||
                     i18n.t("bad.request");
      console.log('Bad request error details:', {
        message,
        errors: error.response.data?.errors,
        data: error.response.data
      });
      toastError(message);
    }
    
    return Promise.reject(error.response);
  }

  // Network errors or other issues
  console.error('Network or other error:', error.message);
  toastError(error.message || i18n.t("network.error"));
  return Promise.reject(error);
}

request.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response.data;
  },
  errorHandler
);

export default request;
