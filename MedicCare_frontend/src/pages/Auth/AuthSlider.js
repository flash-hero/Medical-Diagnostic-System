import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaHeartbeat,
  FaUserMd,
  FaUserShield,
  FaArrowLeft
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthSlider.css';

const AuthSlider = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [mousePosition, setMousePosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [bloodCells, setBloodCells] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Initialize blood cells
  useEffect(() => {
    const cells = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 15 + Math.random() * 15,
      speed: 0.5 + Math.random() * 1.5,
    }));
    setBloodCells(cells);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate blood cells
  useEffect(() => {
    let animationFrameId;
    
    const animate = () => {
      setBloodCells(prevCells =>
        prevCells.map(cell => {
          // Calculate direction towards mouse
          const dx = mousePosition.x - cell.x;
          const dy = mousePosition.y - cell.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Add autonomous movement
          const time = Date.now() * 0.001;
          const autonomousX = Math.sin(time + cell.id) * 1.5;
          const autonomousY = Math.cos(time + cell.id) * 1.5;

          // Always move towards mouse slowly
          let newX = cell.x;
          let newY = cell.y;

          if (distance > 10) {
            // Move towards mouse
            newX += (dx / distance) * cell.speed + autonomousX;
            newY += (dy / distance) * cell.speed + autonomousY;
          } else {
            // When close to mouse, just do autonomous movement
            newX += autonomousX * 2;
            newY += autonomousY * 2;
          }

          // Keep within bounds with padding
          newX = Math.max(20, Math.min(window.innerWidth - 20, newX));
          newY = Math.max(20, Math.min(window.innerHeight - 20, newY));

          return { ...cell, x: newX, y: newY };
        })
      );
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [mousePosition]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8888/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginData.email,
          password: loginData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        const userRole = data.role ? data.role.toLowerCase() : 'patient';
        login({
          username: data.username,
          email: loginData.email,
          name: data.username,
          role: userRole,
          token: data.token
        });
        localStorage.setItem('token', data.token);
        toast.success('Login successful!');
        navigate(`/${userRole}/dashboard`);
      } else {
        const errorText = await response.text();
        toast.error(errorText || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Connection error. Is the server running?');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:8888/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerData.name,
          email: registerData.email,
          password: registerData.password,
          role: registerData.role
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // If doctor, show pending message and redirect to login
        if (data.status === 'PENDING' || (data.role && data.role.toLowerCase() === 'doctor')) {
          toast.success('Registration successful! Your account is pending admin approval. Please wait for approval before logging in.', { duration: 6000 });
          setIsLoginMode(true);
          return;
        }
        
        // Auto-login after registration to get a valid JWT token
        const loginResponse = await fetch('http://localhost:8888/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: registerData.name,
            password: registerData.password
          })
        });

        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          const userRole = loginResult.role ? loginResult.role.toLowerCase() : registerData.role;
          login({
            username: loginResult.username,
            email: data.email,
            name: loginResult.username,
            role: userRole,
            token: loginResult.token
          });
          localStorage.setItem('token', loginResult.token);
          toast.success('Registration successful!');
          navigate(`/${userRole}/dashboard`);
        } else {
          toast.success('Registration successful! Please log in.');
          setIsLoginMode(true);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Connection error. Is the server running?');
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  const roles = [
    { value: 'patient', label: 'Patient', icon: FaHeartbeat, color: '#0066FF' },
    { value: 'doctor', label: 'Doctor', icon: FaUserMd, color: '#10B981' }
  ];

  return (
    <div className="auth-slider-page">
      {/* Blood Cells Animation */}
      {bloodCells.map((cell) => (
        <div
          key={cell.id}
          className="blood-cell"
          style={{
            left: `${cell.x}px`,
            top: `${cell.y}px`,
            width: `${cell.size}px`,
            height: `${cell.size}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="blood-cell-inner"></div>
        </div>
      ))}

      {/* Return Button */}
      <motion.button
        className="return-btn"
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaArrowLeft /> Back to Home
      </motion.button>

      <div className={`auth-slider-container ${!isLoginMode ? 'register-mode' : ''}`}>
        {/* Forms Container */}
        <div className="forms-container">
          {/* Login Form */}
          <motion.div
            className="form-panel login-panel"
            animate={{
              x: isLoginMode ? 0 : '100%',
              opacity: isLoginMode ? 1 : 0
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <h2>Welcome Back</h2>
              <p className="form-subtitle">Login to your account</p>

              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="text"
                  placeholder="Username"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Sign In
              </button>
            </form>
          </motion.div>

          {/* Register Form */}
          <motion.div
            className="form-panel register-panel"
            animate={{
              x: isLoginMode ? '-100%' : 0,
              opacity: isLoginMode ? 0 : 1
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <h2>Create Account</h2>
              <p className="form-subtitle">Sign up to get started</p>

              <div className="input-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              {/* Role Selection - Horizontal */}
              <div className="role-selection-horizontal">
                <p className="role-label">Select Your Role:</p>
                <div className="roles-grid">
                  {roles.map((role) => (
                    <motion.label
                      key={role.value}
                      className={`role-card ${registerData.role === role.value ? 'selected' : ''}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        '--role-color': role.color
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={registerData.role === role.value}
                        onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                      />
                      <role.icon className="role-icon" />
                      <span>{role.label}</span>
                    </motion.label>
                  ))}
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Sign Up
              </button>
            </form>
          </motion.div>
        </div>

        {/* Slider Overlay Panel */}
        <motion.div
          className="slider-panel"
          animate={{
            x: isLoginMode ? 0 : '100%'
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            {isLoginMode ? (
              <motion.div
                key="login-overlay"
                className="slider-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="slider-icon-wrapper">
                  <FaHeartbeat className="slider-icon pulse-animation" />
                </div>
                <h2>New Here?</h2>
                <p>Join our healthcare community and get access to premium medical services</p>
                <button className="overlay-btn" onClick={toggleMode}>
                  Sign Up
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="register-overlay"
                className="slider-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="slider-icon-wrapper">
                  <FaHeartbeat className="slider-icon pulse-animation" />
                </div>
                <h2>Already a Member?</h2>
                <p>Sign in to access your account and continue your healthcare journey</p>
                <button className="overlay-btn" onClick={toggleMode}>
                  Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthSlider;
