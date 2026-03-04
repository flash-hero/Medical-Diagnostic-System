import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaHeartbeat, FaUserMd, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Test backend connectivity on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:8888/auth/users', { method: 'GET' });
        console.log('✓ Backend is reachable. Status:', response.status);
      } catch (error) {
        console.error('✗ Cannot reach backend:', error);
      }
    };
    testConnection();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting registration with:', {
        username: formData.name,
        email: formData.email,
        role: formData.role
      });

      // Call backend API for registration
      const response = await fetch('http://localhost:8888/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Registration error:', errorText);
        throw new Error(errorText || 'Registration failed');
      }

      const registeredUser = await response.json();
      console.log('User registered successfully:', registeredUser.username);
      
      // Now login with the registered credentials
      console.log('Attempting automatic login...');
      const loginResponse = await fetch('http://localhost:8888/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.name,
          password: formData.password,
        }),
      });

      console.log('Login response status:', loginResponse.status);

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.error('Login error:', errorText);
        throw new Error('Registration successful but login failed. Please login manually.');
      }

      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData);
      
      const user = {
        username: loginData.username,
        email: formData.email,
        role: loginData.role,
        token: loginData.token,
      };

      login(user);
      toast.success(`Account created successfully! Welcome ${user.username}!`);
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      console.error('Registration process error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Test function to verify API works
  const testRegistration = async () => {
    console.log('🧪 Testing registration API directly...');
    try {
      const testData = {
        username: 'uitest_' + Date.now(),
        email: 'uitest_' + Date.now() + '@test.com',
        password: 'test123456',
        role: 'patient'
      };
      console.log('Test data:', testData);
      
      const response = await fetch('http://localhost:8888/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      console.log('Test response status:', response.status);
      const data = await response.json();
      console.log('Test response data:', data);
      toast.success('✓ Test registration successful! Check console for details.');
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('✗ Test registration failed: ' + error.message);
    }
  };

  const roleOptions = [
    { value: 'patient', label: 'Patient', icon: FaUser },
    { value: 'doctor', label: 'Doctor', icon: FaUserMd },
    { value: 'admin', label: 'Admin', icon: FaUserShield },
  ];

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="auth-container register-container"
      >
        <div className="auth-header">
          <div className="auth-logo">
            <FaHeartbeat />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join MedicCare today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>I am a:</label>
            <div className="role-selector">
              {roleOptions.map((option) => (
                <label key={option.value} className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={formData.role === option.value}
                    onChange={handleChange}
                  />
                  <div className={`role-card ${formData.role === option.value ? 'selected' : ''}`}>
                    <option.icon className="role-icon" />
                    <span>{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          
          <button 
            type="button" 
            onClick={testRegistration} 
            className="btn btn-secondary btn-full"
            style={{marginTop: '10px', background: '#6c757d'}}
          >
            🧪 Test API Connection
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
