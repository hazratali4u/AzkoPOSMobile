import React, { useMemo, useState } from 'react';

function CompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return companies
      .map((company, index) => ({ ...company, index }))
      .filter((company) => company.name.toLowerCase().includes(query));
  }, [companies, search]);

  const openAddForm = () => {
    setName('');
    setEditingIndex(null);
    setError('');
    setIsEditing(true);
  };

  const openEditForm = (index) => {
    setName(companies[index].name);
    setEditingIndex(index);
    setError('');
    setIsEditing(true);
  };

  const saveCompany = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Company Name is required.');
      return;
    }

    if (editingIndex === null) {
      setCompanies((current) => [...current, { name: name.trim(), active: true }]);
    } else {
      setCompanies((current) => current.map((company, index) => (
        index === editingIndex ? { ...company, name: name.trim() } : company
      )));
    }
    setIsEditing(false);
  };

  const toggleCompany = (index) => {
    setCompanies((current) => current.map((company, companyIndex) => (
      companyIndex === index ? { ...company, active: !company.active } : company
    )));
  };

  return (
    <div className="section-page company-page" data-testid="company-page">
      <h1>Item Management / Company</h1>
      {!isEditing ? (
        <section className="company-card" aria-label="Company list">
          <div className="company-toolbar">
            <input
              className="company-search"
              type="search"
              placeholder="Search Company"
              aria-label="Search Company"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="company-add-button" type="button" onClick={openAddForm}>
              Add Company
            </button>
          </div>
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
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="company-empty-state">
                      {companies.length === 0 ? 'No companies available.' : 'No companies match your search.'}
                    </td>
                  </tr>
                ) : filteredCompanies.map((company) => (
                  <tr key={company.index} className={!company.active ? 'is-inactive' : ''}>
                    <td data-label="Company Name">{company.name}</td>
                    <td data-label="Edit">
                      <button
                        className="company-icon-button company-edit-button"
                        type="button"
                        aria-label={`Edit ${company.name}`}
                        onClick={() => openEditForm(company.index)}
                      >
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </td>
                    <td data-label="Active/Inactive">
                      <button
                        className={`company-icon-button company-toggle-button${company.active ? '' : ' is-inactive'}`}
                        type="button"
                        aria-label={`${company.active ? 'Deactivate' : 'Activate'} ${company.name}`}
                        onClick={() => toggleCompany(company.index)}
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
            <div className="company-form-field">
              <label htmlFor="company-name">Company Name <span aria-hidden="true">*</span></label>
              <input
                id="company-name"
                type="text"
                placeholder="Company Name"
                value={name}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'company-name-error' : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  if (event.target.value.trim()) setError('');
                }}
              />
              {error && <span id="company-name-error" className="required-field-error" role="alert">{error}</span>}
            </div>
            <div className="company-form-actions">
              <button className="company-save-button" type="submit">Save</button>
              <button className="company-cancel-button" type="button" onClick={() => setIsEditing(false)}>
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
