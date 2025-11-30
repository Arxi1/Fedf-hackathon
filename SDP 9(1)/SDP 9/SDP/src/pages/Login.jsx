import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onSelectRole, onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('donor');
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [theme, setTheme] = useState('default');

  // Generate random captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    if (captchaInput !== captcha) {
      alert('Incorrect captcha. Please try again.');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    // Simple validation (Simulated authentication)
    if (email && password) {
      // Using static IDs so your History persists across refreshes!
      const staticIds = {
        donor: 'donor_user_123',
        recipient: 'recipient_user_456',
        analyst: 'analyst_user_789',
        admin: 'admin_user_000'
      };

      onLogin({ uid: staticIds[selectedRole], email: email });
      onSelectRole(selectedRole);
      navigate(`/${selectedRole}`);
    } else {
      alert("Please enter both email and password.");
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="vh-100 position-relative d-flex">
      {/* Left side - Background image */}
      <div className="d-none d-sm-block flex-grow-1">
        <div className="d-flex justify-content-center vh-100 align-items-center">
          <div className="erp-img">&nbsp;</div>
          <div className="position-absolute bottom-0 text-center">
            <small className="text-white text-center">© Copyright 2024 by FoodConnect. All Rights Reserved.</small>
          </div>
          <div className="farm-location">
            <i className="fas fa-map-marker-alt me-2"></i>
            Real-time Farm Location: Hyderabad, India
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="login_bg w-35 overflow-auto d-flex flex-column flex-grow-0">
        <div className="mt-3 mx-xl-5 mx-3 d-flex align-items-center justify-content-between">
          <div>
            <img src="https://via.placeholder.com/24x24/667eea/ffffff?text=FC" alt="" height="24px" className="me-2" />
            <img src="https://via.placeholder.com/24x24/764ba2/ffffff?text=FC" alt="" height="24px" />
          </div>
          <form className="color-picker">
            <fieldset>
              <legend className="visually-hidden">Pick a color scheme</legend>
              <input type="radio" name="theme" id="default" value="default" checked={theme === 'default'} onChange={() => handleThemeChange('default')} />
              <label htmlFor="default" title="Sky Blue"></label>
              <input type="radio" name="theme" id="theme1" value="theme1" checked={theme === 'theme1'} onChange={() => handleThemeChange('theme1')} />
              <label htmlFor="theme1" title="Brown"></label>
              <input type="radio" name="theme" id="theme3" value="theme3" checked={theme === 'theme3'} onChange={() => handleThemeChange('theme3')} />
              <label htmlFor="theme3" title="Green"></label>
              <input type="radio" name="theme" id="theme6" value="theme6" checked={theme === 'theme6'} onChange={() => handleThemeChange('theme6')} />
              <label htmlFor="theme6" title="Violet"></label>
              <input type="radio" name="theme" id="theme8" value="theme8" checked={theme === 'theme8'} onChange={() => handleThemeChange('theme8')} />
              <label htmlFor="theme8" title="Dark Yash"></label>
              <input type="radio" name="theme" id="theme11" value="theme11" checked={theme === 'theme11'} onChange={() => handleThemeChange('theme11')} />
              <label htmlFor="theme11" title="Purple"></label>
            </fieldset>
          </form>
        </div>

        <div className="d-flex align-items-center justify-content-center flex-grow-1 m-auto">
          <div className="shadow rounded-3 login-box m-5 card">
            <h4 className="redflag-text text-center m-4">Login to FoodConnect</h4>
            <div className="site-login pb-3">
              <form id="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <div className="floating-label field-loginFormUserNameID required">
                    <input type="email" id="loginFormUserNameID" className="form-control" name="LoginForm[username]" required placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} />
                    <label className="control-label" htmlFor="loginFormUserNameID">Enter Email <span className="text-danger">*</span></label>
                  </div>
                </div>

                <div className="form-group">
                  <div className="floating-label field-loginFormPasswordID required">
                    <input type="password" id="loginFormPasswordID" className="form-control" name="LoginForm[password]" required placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} />
                    <label className="control-label" htmlFor="loginFormPasswordID">Enter Password <span className="text-danger">*</span></label>
                  </div>
                </div>

                <div className="form-group">
                  <label>I am logging in as...</label>
                  <select className="form-control" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                    <option value="donor">Food Donor (Restaurant/Store)</option>
                    <option value="recipient">Recipient Organization (NGO)</option>
                    <option value="analyst">Data Analyst</option>
                    <option value="admin">Platform Admin</option>
                  </select>
                </div>

                <div className="form-group field-loginFormCaptcha">
                  <label className="control-label" htmlFor="loginform-captcha">Verification Code</label>
                  <div className="d-flex">
                    <div className="captcha-display me-2 p-2 border rounded bg-light">
                      <strong>{captcha}</strong>
                    </div>
                    <input type="text" id="loginFormCaptcha" className="form-control" name="LoginForm[captcha]" placeholder="Enter code" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required />
                  </div>
                  <small className="text-muted">Enter the code shown above</small>
                </div>

                <div className="form-group">
                  <div className="text-center d-grid">
                    <button type="submit" className="btn btn-custom mb-3 w-auto">Login</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
