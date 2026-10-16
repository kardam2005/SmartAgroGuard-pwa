import api from './api';

export const AuthService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.detail || 'Invalid email or password.';
      return { success: false, error: msg };
    }
  },

  register: async (username, email, password, mobileNo, role = "Farmer") => {
    try {
      const response = await api.post('/api/v1/auth/register', {
        user_name: username,
        user_role: role,
        password: password,
        email: email,
        mobile_no: mobileNo
      });
      return { success: true, data: response.data };
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to create account.';
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  resetPassword: async (email, newPassword) => {
    try {
      const response = await api.post('/api/v1/auth/reset-password', {
        email: email,
        new_password: newPassword
      });
      return { success: true, data: response.data };
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to reset password.';
      return { success: false, error: msg };
    }
  }
};
