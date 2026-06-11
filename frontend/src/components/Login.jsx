import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login({ onLoginSuccess }) {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = 'Invalid email format.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (isRegistering) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    (async () => {
      if (isRegistering) {
        const res = await register(formData.email.trim(), formData.password);
        if (res.success) {
          onLoginSuccess(res.user);
        } else {
          if (res.fieldErrors) setErrors(res.fieldErrors);
          if (res.error) setServerError(res.error);
        }
      } else {
        const res = await login(formData.email.trim(), formData.password);
        if (res.success) {
          onLoginSuccess(res.user);
        } else {
          if (res.fieldErrors) setErrors(res.fieldErrors);
          if (res.error) setServerError(res.error);
        }
      }
      setIsSubmitting(false);
    })();
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setErrors({});
    setServerError(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="auth-container">
      <div className="card login-card">
        <div className="card-header">
          <h1 className="brand-title">RoomEase</h1>
          <p className="card-subtitle">Melbourne Student Accommodation & Roommate Finder</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {serverError && <div className="alert alert-danger">{serverError}</div>}
          {/* Full name removed from signup per product decision */}

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} className="input-icon" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={isRegistering ? "student@unimelb.edu.au" : "your@email.com"}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && (
              <span className="error-text">
                <AlertCircle size={16} />
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} className="input-icon" />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">
                <AlertCircle size={16} />
                {errors.password}
              </span>
            )}
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={18} className="input-icon" />
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'input-error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">
                  <AlertCircle size={16} />
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="toggle-btn"
              onClick={toggleAuthMode}
            >
              {isRegistering ? 'Sign In' : 'Register Here'}
            </button>
          </p>
        </div>

        <div className="info-box">
          <p className="text-muted">
            Your information is stored securely and is used solely for matching you with potential roommates and student accommodation in Melbourne.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
