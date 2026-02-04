import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.249:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Send cookies with requests
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Attaching auth token:', token);
      // Try Bearer first (JWT), but if your backend uses TokenAuthentication, 
      // you might need: config.headers.Authorization = `Token ${token}`;
      // Based on typical JWT setups, Bearer is correct.
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token found in localStorage for request');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== VISITOR APIs ====================

/**
 * Submit visitor form
 * @param {Object} visitorData - Visitor information
 * @returns {Promise} API response
 */
export const submitVisitorForm = async (visitorData) => {
  try {
    const response = await apiClient.post('/api/entries/', {
      full_name: visitorData.name,
      email: visitorData.email,
      phone_number: visitorData.phone,
      host: visitorData.host,
      purpose: visitorData.purpose,
      additional_details: visitorData.message,
      // Backend handles entry_time automatically, but if you need to send checkin_time:
      checkin_time: new Date().toISOString(),
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error submitting visitor form:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit visitor form. Please try again.',
    };
  }
};

// ==================== ADMIN APIs ====================

/**
 * Admin login
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise} API response with token
 */
export const adminLogin = async (email, password) => {
  try {
    // Many backends expect 'username' even if it's an email
    const response = await apiClient.post('/api/login/', { email, password });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error during admin login:', error.response?.data || error.message);

    let errorMessage = 'Invalid credentials. Please try again.';
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your network connection.';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Network error. Please ensure the server is running.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Get all visitors with optional filters
 * @param {Object} params - Query parameters (search, purpose, startDate, endDate, page, limit)
 * @returns {Promise} API response with visitors list
 */
export const getVisitors = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/entries/', { params });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch visitors. Please try again.',
    };
  }
};

/**
 * Get visitor by ID
 * @param {number} id - Visitor ID
 * @returns {Promise} API response with visitor details
 */
export const getVisitorById = async (id) => {
  try {
    const response = await apiClient.get(`/api/entries/${id}/`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching visitor:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch visitor details.',
    };
  }
};

/**
 * Delete visitor by ID
 * @param {number} id - Visitor ID
 * @returns {Promise} API response
 */
export const deleteVisitor = async (id) => {
  try {
    const response = await apiClient.delete(`/api/entries/${id}/`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error deleting visitor:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete visitor.',
    };
  }
};

/**
 * Get dashboard statistics
 * @returns {Promise} API response with stats
 */
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/api/entries/');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch dashboard statistics.',
    };
  }
};

export default apiClient;
