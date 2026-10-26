import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const missingUsername = !username.trim();
    const missingPassword = !password.trim();
    setUsernameError(missingUsername ? 'Username is required.' : '');
    setPasswordError(missingPassword ? 'Password is required.' : '');

    if (missingUsername || missingPassword) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.azkopos.com/AzkoAPI/GetUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: username,
          Password: password,
          TypeID: 1,
        }),
      });

      if (!response.ok) {
        setPasswordError('Invalid login ID or password.');
        return;
      }

      const user = await response.json();
      if (
        !user
        || !Number.isFinite(user.userID)
        || typeof user.employeeName !== 'string'
        || !user.employeeName.trim()
        || !Number.isFinite(user.roleID)
        || typeof user.connString !== 'string'
        || !user.connString.trim()
      ) {
        setPasswordError('Invalid login ID or password.');
        return;
      }

      onLogin(user);
    } catch {
      setPasswordError('Invalid login ID or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-header-content">Welcome To AzkoPOS</div>
      </header>

      <div className="main-panel login-main-panel">
        <div className="content-wrapper login-content-wrapper">
          <div className="page-header flex-wrap">
            <h3 className="mb-0">Login Form</h3>
          </div>
          <div className="row">
            <div className="card" style={{ width: '100%' }}>
              <div className="card-body">
                <form noValidate onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="txtUsername">Username *</label>
                    <input
                      id="txtUsername"
                      className="form-control"
                      type="text"
                      placeholder="Username"
                      aria-invalid={Boolean(usernameError)}
                      aria-describedby={usernameError ? 'username-error' : undefined}
                      value={username}
                      onChange={(event) => {
                        setUsername(event.target.value);
                        setUsernameError('');
                      }}
                      required
                    />
                    {usernameError && (
                      <span id="username-error" className="required-field-error" role="alert">
                        {usernameError}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="txtPassword">Password *</label>
                    <input
                      id="txtPassword"
                      className="form-control"
                      type="password"
                      placeholder="Password"
                      aria-invalid={Boolean(passwordError)}
                      aria-describedby={passwordError ? 'password-error' : undefined}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setPasswordError('');
                      }}
                      required
                    />
                    {passwordError && (
                      <span id="password-error" className="required-field-error" role="alert">
                        {passwordError}
                      </span>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary mr-2" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setUsername('');
                      setPassword('');
                      setUsernameError('');
                      setPasswordError('');
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <footer className="footer">
          <div className="d-sm-flex justify-content-center justify-content-sm-between">
            <span className="text-muted d-block text-center text-sm-left d-sm-inline-block">
              Copyright © AzkoIT 2025
            </span>
            <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
              &nbsp;
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;
