import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Register user
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  
  if (response.data.success) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  
  if (response.data.success) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get auth header
const getAuthHeader = () => {
  const user = getCurrentUser();
  
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getAuthHeader,
};

export default authService;