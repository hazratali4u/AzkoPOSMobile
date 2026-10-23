import React, { useMemo, useState } from 'react';

const emptyUser = {
  loginName: '',
  password: '',
  employeeName: '',
  role: '1',
  active: true,
};

function UserPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [formUser, setFormUser] = useState(emptyUser);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [errors, setErrors] = useState({});

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users
      .map((user, index) => ({ ...user, index }))
      .filter((user) => `${user.loginName} ${user.employeeName} ${user.role === '1' ? 'Admin' : 'Data Entry'}`
        .toLowerCase().includes(query));
  }, [search, users]);

  const openAddForm = () => {
    setFormUser(emptyUser);
    setEditingIndex(null);
    setErrors({});
    setIsAddingUser(true);
  };

  const cancelForm = () => {
    setErrors({});
    setIsAddingUser(false);
  };

  const saveUser = (event) => {
    event.preventDefault();
    const nextErrors = {
      loginName: formUser.loginName.trim() ? '' : 'Login Name is required.',
      password: formUser.password.trim() ? '' : 'Password is required.',
      employeeName: formUser.employeeName.trim() ? '' : 'Employee Name is required.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (editingIndex === null) {
      setUsers((currentUsers) => [...currentUsers, { ...formUser }]);
    } else {
      setUsers((currentUsers) => currentUsers.map((user, index) => (
        index === editingIndex ? { ...formUser, active: user.active } : user
      )));
    }
    setIsAddingUser(false);
  };

  const editUser = (index) => {
    setFormUser({ ...users[index] });
    setEditingIndex(index);
    setErrors({});
    setIsAddingUser(true);
  };

  const toggleUser = (index) => {
    setUsers((currentUsers) => currentUsers.map((user, userIndex) => (
      userIndex === index ? { ...user, active: !user.active } : user
    )));
  };

  return (
    <div className="section-page user-page" data-testid="user-page">
      <h1>Setting / User</h1>
      {!isAddingUser ? (
        <section className="user-card" aria-label="User list">
          <div className="user-toolbar">
            <input
              className="user-search"
              type="search"
              placeholder="Search User"
              aria-label="Search User"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="user-add-button" type="button" onClick={openAddForm}>Add User</button>
          </div>
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th scope="col">Login Name</th>
                  <th scope="col">Employee Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Active/Inactive</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="user-empty-state">
                      {users.length === 0 ? 'No users available.' : 'No users match your search.'}
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.index} className={!user.active ? 'is-inactive' : ''}>
                    <td data-label="Login Name">{user.loginName}</td>
                    <td data-label="Employee Name">{user.employeeName}</td>
                    <td data-label="Role">{user.role === '1' ? 'Admin' : 'Data Entry'}</td>
                    <td data-label="Edit">
                      <button className="user-icon-button user-edit-button" type="button" aria-label={`Edit ${user.loginName}`} onClick={() => editUser(user.index)}>
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </td>
                    <td data-label="Active/Inactive">
                      <button className={`user-icon-button user-toggle-button${user.active ? '' : ' is-inactive'}`} type="button" aria-label={`${user.active ? 'Deactivate' : 'Activate'} ${user.loginName}`} onClick={() => toggleUser(user.index)}>
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="user-card" aria-label={editingIndex === null ? 'Add user' : 'Edit user'}>
          <form className="user-form" onSubmit={saveUser} noValidate>
            <div className="user-form-field">
              <label htmlFor="user-login-name">Login Name <span aria-hidden="true">*</span></label>
              <input
                id="user-login-name"
                type="text"
                placeholder="Login Name"
                value={formUser.loginName}
                aria-invalid={Boolean(errors.loginName)}
                aria-describedby={errors.loginName ? 'user-login-name-error' : undefined}
                onChange={(event) => {
                  const loginName = event.target.value;
                  setFormUser({ ...formUser, loginName });
                  if (loginName.trim()) setErrors((current) => ({ ...current, loginName: '' }));
                }}
              />
              {errors.loginName && <span id="user-login-name-error" className="required-field-error" role="alert">{errors.loginName}</span>}
            </div>
            <div className="user-form-field">
              <label htmlFor="user-password">Password <span aria-hidden="true">*</span></label>
              <input
                id="user-password"
                type="password"
                placeholder="Password"
                value={formUser.password}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'user-password-error' : undefined}
                onChange={(event) => {
                  const password = event.target.value;
                  setFormUser({ ...formUser, password });
                  if (password.trim()) setErrors((current) => ({ ...current, password: '' }));
                }}
              />
              {errors.password && <span id="user-password-error" className="required-field-error" role="alert">{errors.password}</span>}
            </div>
            <div className="user-form-field">
              <label htmlFor="user-employee-name">Employee Name <span aria-hidden="true">*</span></label>
              <input
                id="user-employee-name"
                type="text"
                placeholder="Employee Name"
                value={formUser.employeeName}
                aria-invalid={Boolean(errors.employeeName)}
                aria-describedby={errors.employeeName ? 'user-employee-name-error' : undefined}
                onChange={(event) => {
                  const employeeName = event.target.value;
                  setFormUser({ ...formUser, employeeName });
                  if (employeeName.trim()) setErrors((current) => ({ ...current, employeeName: '' }));
                }}
              />
              {errors.employeeName && <span id="user-employee-name-error" className="required-field-error" role="alert">{errors.employeeName}</span>}
            </div>
            <fieldset className="user-role-options">
              <legend>Role</legend>
              <label>
                <input type="radio" name="user-role" value="1" checked={formUser.role === '1'} onChange={(event) => setFormUser({ ...formUser, role: event.target.value })} />
                Admin
              </label>
              <label>
                <input type="radio" name="user-role" value="2" checked={formUser.role === '2'} onChange={(event) => setFormUser({ ...formUser, role: event.target.value })} />
                Data Entry
              </label>
            </fieldset>
            <div className="user-form-actions">
              <button className="user-save-button" type="submit">Save</button>
              <button className="user-cancel-button" type="button" onClick={cancelForm}>Cancel</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default UserPage;
