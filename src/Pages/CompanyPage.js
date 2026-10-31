import React, {useEffect, useMemo, useState } from 'react';
import { useUser } from '../UserContext';
import '../css/CompanyPage.css';
const emptyCompany = {
  companyID: '',
  companyName: '',
  active: true,
};

function CompanyPage() {
  const user = useUser();
    const connString = user && user.connString;
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [formCompany, setFormCompany] = useState(emptyCompany);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
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
      async function loadCompanies() {
        setCompanies([]);
        if (typeof connString !== 'string' || !connString.trim()) {
          setLoadError('Unable to load companies.');
          setIsLoading(false);
          return;
        }
  
        setIsLoading(true);
        setLoadError('');  
        try {
          const response = await fetch('https://api.azkopos.com/Company/GetAllCompanyData?TypeID=1', {
            method: 'GET',
            headers: {
              ConnectionString: connString,
            },
          });
  
          if (!response.ok) {
            throw new Error('Company request failed.');
          }
  
          const data = await response.json();
          if (!Array.isArray(data) || data.some((item) => (
            !item
            || !Number.isFinite(item.companyID)
            || typeof item.name !== 'string'
            || typeof item.status !== 'string'
          ))) {
            throw new Error('Company response is invalid.');
          }
  
          if (isActive) {
            setCompanies(data.map((item) => ({
              companyID: item.companyID,
              companyName: item.name,
              active: item.status.toLowerCase() === 'active',
            })));
          }
        } catch {
          if (isActive) {
            setLoadError('Unable to load companies. Please try again.');
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }
  
      loadCompanies();
      return () => {
        isActive = false;
      };
    }, [connString, reloadKey]);

    const filteredCompanies = useMemo(() => {
        const query = search.trim().toLowerCase();
        return companies
          .map((company, index) => ({ ...company, index }))
          .filter((company) => `${company.companyName}`
            .toLowerCase().includes(query));
      }, [search, companies]);

const openAddForm = () => {
    setFormCompany(emptyCompany);
    setEditingIndex(null);
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingCompany(true);
  };

    const cancelForm = () => {
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingCompany(false);
  };

const saveCompany = async (event) => {
    event.preventDefault();
    setSaveError('');
    setSaveMessage('');
    const nextErrors = {
      companyName: formCompany.companyName.trim() ? '' : 'Company Name is required.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || (editingIndex !== null && !Number.isFinite(formCompany.companyID))
    ) {
      setSaveError('Unable to save company.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('https://api.azkopos.com/Company/InsertUpdateCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          CompanyID: editingIndex === null ? 0 : formCompany.companyID,
          Name: formCompany.companyName.trim(),
          UserID: user.userID,
          TypeID: editingIndex === null ? 1 : 2,
        }),
      });

      if (!response.ok) {
        throw new Error('Company save request failed.');
      }

      setSaveMessage('Company saved successfully.');
      setIsAddingCompany(false);
      setReloadKey((key) => key + 1);
    } catch {
      setSaveError('Unable to save company. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const editCompany = (index) => {
    setFormCompany({ ...companies[index] });
    setEditingIndex(index);
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingCompany(true);
  };
  
  const toggleCompany = async (index) => {
    const selectedCompany = companies[index];
    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || !Number.isFinite(selectedCompany && selectedCompany.companyID)
    ) {
      setSaveError('Unable to update company status.');
      return;
    }

    setSaveError('');
    setSaveMessage('');
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('https://api.azkopos.com/Company/InsertUpdateCompany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          CompanyID: selectedCompany.companyID,
          Name: selectedCompany.companyName,
          UserID: user.userID,
          TypeID: selectedCompany.active ? 3 : 4,
        }),
      });

      if (!response.ok) {
        throw new Error('Company status request failed.');
      }

      setCompanies((currentCompanies) => currentCompanies.map((currentCompany) => (
        currentCompany.companyID === selectedCompany.companyID
          ? { ...currentCompany, active: !selectedCompany.active }
          : currentCompany
      )));
      setSaveMessage('Company status updated successfully.');
    } catch {
      setSaveError('Unable to update company status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  return (
    <div className="section-page company-page" data-testid="company-page">
      <h1>Setting / Company</h1>
      {!isAddingCompany ? (
        <section className="company-card" aria-label="Company list">
          <div className="company-toolbar">
            <label className="page-search-wrap">
              <span className="page-search-icon" aria-hidden="true">⌕</span>
              <input
                className="page-search-input"
                type="search"
                placeholder="Search Company"
                aria-label="Search Company"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <button className="company-add-button" type="button" onClick={openAddForm}>
              <span aria-hidden="true">＋</span> Add Company
            </button>
          </div>
          {loadError && (
            <div role="alert">
              {loadError}
              {typeof connString === 'string' && connString.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setReloadKey((key) => key + 1);
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          )}
          {saveError && <div role="alert">{saveError}</div>}
          {saveMessage && <div role="status">{saveMessage}</div>}
          <div className="company-table-wrap">
            <table className="company-table">
              <thead>
                <tr>
                  <th scope="col">Company Name</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Active/Inactive</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="company-empty-state" role="status">Loading companies...</td>
                  </tr>
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="company-empty-state">
                      {companies.length === 0 ? 'No companies available.' : 'No companies match your search.'}
                    </td>
                  </tr>
                ) : filteredCompanies.map((company) => (
                  <tr key={company.companyID || company.index} className={!company.active ? 'is-inactive' : ''}>
                    <td data-label="Company Name">{company.companyName}</td>
                    <td data-label="Edit">
                      <button
                        className="user-icon-button user-edit-button"
                        type="button"
                        aria-label={`Edit ${company.companyName}`}
                        onClick={() => editCompany(company.index)}
                      >
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </td>
                    <td data-label="Active/Inactive">
                      <button
                        className={`user-icon-button user-toggle-button${company.active ? '' : ' is-inactive'}`}
                        type="button"
                        aria-label={`${company.active ? 'Deactivate' : 'Activate'} ${company.companyName}`}
                        onClick={() => toggleCompany(company.index)}
                        disabled={isUpdatingStatus}
                      >
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
        <section className="company-card" aria-label={editingIndex === null ? 'Add Company' : 'Edit Company'}>
          <form className="company-form" onSubmit={saveCompany} noValidate>
            {saveError && <div role="alert">{saveError}</div>}
            <div className="company-form-field">
              <label htmlFor="company-name">Company Name <span aria-hidden="true">*</span></label>
              <input
                id="company-name"
                type="text"
                placeholder="Company Name"
                value={formCompany.companyName}
                aria-invalid={Boolean(errors.companyName)}
                aria-describedby={errors.companyName ? 'company-name-error' : undefined}
                onChange={(event) => {
                  const companyName = event.target.value;
                  setFormCompany({ ...formCompany, companyName });
                  if (companyName.trim()) setErrors((current) => ({ ...current, companyName: '' }));
                }}
              />
              {errors.companyName && <span id="company-name-error" className="required-field-error" role="alert">{errors.companyName}</span>}
            </div>
            <div className="company-form-actions">
              <button className="company-save-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="company-cancel-button"
                type="button"
                onClick={cancelForm}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default CompanyPage;