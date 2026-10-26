import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../UserContext';
import './UserPage.css';

const emptyUser = {
  userID: '',
  roleID: 1,
  loginName: '',
  password: '',
  employeeName: '',
  role: '1',
  roleName: 'Admin',
  active: true,
};

function UserPage() {
  const user = useUser();
  const connString = user && user.connString;
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [formUser, setFormUser] = useState(emptyUser);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(Boolean(connString));
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadUsers() {
      if (typeof connString !== 'string' || !connString.trim()) {
        setLoadError('Unable to load users.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch('https://api.azkopos.com/AzkoAPI/GetAllUserData?TypeID=2', {
          method: 'GET',
          headers: {
            ConnectionString: connString,
          },
        });

        if (!response.ok) {
          throw new Error('User request failed.');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.some((item) => (
          !item
          || !Number.isFinite(item.userID)
          || typeof item.loginID !== 'string'
          || typeof item.password !== 'string'
          || typeof item.employeeName !== 'string'
          || !Number.isFinite(item.roleID)
          || typeof item.role !== 'string'
          || typeof item.status !== 'string'
        ))) {
          throw new Error('User response is invalid.');
        }

        if (isActive) {
          setUsers(data.map((item) => ({
            userID: item.userID,
            roleID: item.roleID,
            loginName: item.loginID,
            password: item.password,
            employeeName: item.employeeName,
            role: String(item.roleID),
            roleName: item.role,
            active: item.status.toLowerCase() === 'active',
          })));
        }
      } catch {
        if (isActive) {
          setLoadError('Unable to load users. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      isActive = false;
    };
  }, [connString, reloadKey]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users
      .map((user, index) => ({ ...user, index }))
      .filter((user) => `${user.loginName} ${user.employeeName} ${user.roleName || (user.role === '1' ? 'Admin' : 'Data Entry')}`
        .toLowerCase().includes(query));
  }, [search, users]);

  const openAddForm = () => {
    setFormUser(emptyUser);
    setEditingIndex(null);
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingUser(true);
  };

  const cancelForm = () => {
    setErrors({});
    setSaveError('');
    setIsAddingUser(false);
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setSaveError('');
    setSaveMessage('');
    const nextErrors = {
      loginName: formUser.loginName.trim() ? '' : 'Login Name is required.',
      password: formUser.password.trim() ? '' : 'Password is required.',
      employeeName: formUser.employeeName.trim() ? '' : 'Employee Name is required.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || (editingIndex !== null && !Number.isFinite(formUser.userID))
    ) {
      setSaveError('Unable to save user.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('https://api.azkopos.com/AzkoAPI/InsertUpdateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          UserID: editingIndex === null ? 0 : formUser.userID,
          LoginID: formUser.loginName,
          Password: formUser.password,
          EmployeeName: formUser.employeeName,
          RoleID: Number(formUser.role),
          CreateUpdatedBy: user.userID,
          TypeID: editingIndex === null ? 1 : 2,
        }),
      });

      if (!response.ok) {
        throw new Error('User save request failed.');
      }

      setSaveMessage('User saved successfully.');
      setIsAddingUser(false);
      setReloadKey((key) => key + 1);
    } catch {
      setSaveError('Unable to save user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const editUser = (index) => {
    setFormUser({ ...users[index] });
    setEditingIndex(index);
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingUser(true);
  };

  const toggleUser = async (index) => {
    const selectedUser = users[index];
    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || !Number.isFinite(selectedUser && selectedUser.userID)
    ) {
      setSaveError('Unable to update user status.');
      return;
    }

    setSaveError('');
    setSaveMessage('');
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('https://api.azkopos.com/AzkoAPI/InsertUpdateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          UserID: selectedUser.userID,
          LoginID: selectedUser.loginName,
          Password: selectedUser.password,
          EmployeeName: selectedUser.employeeName,
          RoleID: selectedUser.roleID,
          CreateUpdatedBy: user.userID,
          TypeID: selectedUser.active ? 3 : 4,
        }),
      });

      if (!response.ok) {
        throw new Error('User status request failed.');
      }

      setUsers((currentUsers) => currentUsers.map((currentUser) => (
        currentUser.userID === selectedUser.userID
          ? { ...currentUser, active: !selectedUser.active }
          : currentUser
      )));
      setSaveMessage('User status updated successfully.');
    } catch {
      setSaveError('Unable to update user status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div
      className="section-page user-page"
      data-testid="user-page"
      onClickCapture={(event) => {
        if (event.target instanceof Element && event.target.closest('button')) {
          setSaveMessage('');
        }
      }}
    >
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
          {loadError && <div role="alert">{loadError}</div>}
          {saveError && <div role="alert">{saveError}</div>}
          {saveMessage && <div role="status">{saveMessage}</div>}
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
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="user-empty-state" role="status">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="user-empty-state">
                      {users.length === 0 ? 'No users available.' : 'No users match your search.'}
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.userID || user.index} className={!user.active ? 'is-inactive' : ''}>
                    <td data-label="Login Name">
                      <input type="hidden" name="userID" value={user.userID} readOnly />
                      {user.loginName}
                    </td>
                    <td data-label="Employee Name">{user.employeeName}</td>
                    <td data-label="Role">
                      <input type="hidden" name="roleID" value={user.roleID} readOnly />
                      {user.roleName || (user.role === '1' ? 'Admin' : 'Data Entry')}
                    </td>
                    <td data-label="Edit">
                      <button className="user-icon-button user-edit-button" type="button" aria-label={`Edit ${user.loginName}`} onClick={() => editUser(user.index)}>
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </td>
                    <td data-label="Active/Inactive">
                      <button className={`user-icon-button user-toggle-button${user.active ? '' : ' is-inactive'}`} type="button" aria-label={`${user.active ? 'Deactivate' : 'Activate'} ${user.loginName}`} onClick={() => toggleUser(user.index)} disabled={isUpdatingStatus}>
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
            {saveError && <div role="alert">{saveError}</div>}
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
              <button className="user-save-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button className="user-cancel-button" type="button" onClick={cancelForm} disabled={isSaving}>Cancel</button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default UserPage;
