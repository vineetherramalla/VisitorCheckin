/**
 * Authentication service for managing user sessions
 */

const AUTH_TOKEN_KEY = 'authToken';
const ADMIN_USER_KEY = 'adminUser';

/**
 * Store authentication token
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

/**
 * Get authentication token
 * @returns {string|null} JWT token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Remove authentication token
 */
export const removeAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Store admin user data
 * @param {Object} user - Admin user object
 */
export const setAdminUser = (user) => {
  if (user) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  }
};

/**
 * Get admin user data
 * @returns {Object|null} Admin user object or null
 */
export const getAdminUser = () => {
  const user = localStorage.getItem(ADMIN_USER_KEY);
  if (!user || user === 'undefined') return null;
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing admin user:', error);
    return null;
  }
};

/**
 * Remove admin user data
 */
export const removeAdminUser = () => {
  localStorage.removeItem(ADMIN_USER_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Logout user - clear all auth data
 */
export const logout = () => {
  removeAuthToken();
  removeAdminUser();
};

/**
 * Login user - store token and user data
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
export const login = (token, user) => {
  setAuthToken(token);
  setAdminUser(user);
};

export default {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setAdminUser,
  getAdminUser,
  removeAdminUser,
  isAuthenticated,
  logout,
  login,
};
