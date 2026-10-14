import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanEmail = form.email.trim().toLowerCase();
      const res = await authService.login(cleanEmail, form.password);
      const { token, id, name, email, role } = res.data;
      login({ id, name, email, role }, token);
      toast.success(`Welcome back, ${name}!`);
      navigate(role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      let message = 'Login failed. Check your credentials.';
      if (typeof err.response?.data === 'string') {
        message = err.response.data;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (typeof err.response?.data === 'object') {
        message = Object.values(err.response.data).join(', ');
      } else if (!err.response) {
        message = 'Unable to connect to the backend server on port 8081. Please check if the backend is running.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🅿</div>
          <h1>SmartPark</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>

        <div className="demo-credentials">
          <p style={{ cursor: 'pointer', margin: '4px 0' }} onClick={() => fillDemo('admin@smartpark.com', 'admin123')} title="Click to autofill Admin">
            <strong>Demo Admin:</strong> admin@smartpark.com / admin123 <span style={{ textDecoration: 'underline', fontSize: '11px', color: '#6366f1' }}>(Click to fill)</span>
          </p>
          <p style={{ cursor: 'pointer', margin: '4px 0' }} onClick={() => fillDemo('user@smartpark.com', 'user123')} title="Click to autofill User">
            <strong>Demo User:</strong> user@smartpark.com / user123 <span style={{ textDecoration: 'underline', fontSize: '11px', color: '#6366f1' }}>(Click to fill)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
