import React from 'react';

function LoginPage({ onLogin }) {
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
                <div className="form-group">
                  <div id="lblError" className="text-danger"></div>
                </div>

                <div className="form-group">
                  <label htmlFor="txtUsername">Username *</label>
                  <input
                    id="txtUsername"
                    className="form-control"
                    type="text"
                    placeholder="Username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="txtPassword">Password *</label>
                  <input
                    id="txtPassword"
                    className="form-control"
                    type="password"
                    placeholder="Password"
                  />
                </div>

                <button type="button" className="btn btn-primary mr-2" onClick={onLogin}>
                  Login
                </button>
                <button type="button" className="btn btn-danger">
                  Cancel
                </button>
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
