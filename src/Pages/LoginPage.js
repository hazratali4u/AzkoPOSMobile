import React, { useState } from 'react';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
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
        setError('Invalid login ID or password.');
        return;
      }

      const user = await response.json();
      if (
        !user
        || !Number.isFinite(user.userID)
        || typeof user.employeeName !== 'string'
        || !user.employeeName.trim()
        || !Number.isFinite(user.roleID)
      ) {
        setError('Invalid login ID or password.');
        return;
      }

      onLogin(user);
    } catch {
      setError('Invalid login ID or password.');
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
                <form onSubmit={handleSubmit}>
                  {error && <div className="form-group text-danger" role="alert">{error}</div>}

                  <div className="form-group">
                    <label htmlFor="txtUsername">Username *</label>
                    <input
                      id="txtUsername"
                      className="form-control"
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="txtPassword">Password *</label>
                    <input
                      id="txtPassword"
                      className="form-control"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
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
