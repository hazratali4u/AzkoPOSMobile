import React, { useMemo, useState } from 'react';
import './ModelPage.css';

function RamRomPage() {
  const [ramRoms, setRamRoms] = useState([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const filteredRamRoms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ramRoms
      .map((ramRom, index) => ({ ...ramRom, index }))
      .filter((ramRom) => ramRom.name.toLowerCase().includes(query));
  }, [ramRoms, search]);

  const openAddForm = () => {
    setName('');
    setEditingIndex(null);
    setError('');
    setIsEditing(true);
  };

  const openEditForm = (index) => {
    setName(ramRoms[index].name);
    setEditingIndex(index);
    setError('');
    setIsEditing(true);
  };

  const saveRamRom = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('RamRom Name is required.');
      return;
    }

    if (editingIndex === null) {
      setRamRoms((current) => [...current, { name: name.trim(), active: true }]);
    } else {
      setRamRoms((current) => current.map((ramRom, index) => (
        index === editingIndex ? { ...ramRom, name: name.trim() } : ramRom
      )));
    }
    setIsEditing(false);
  };

  const toggleRamRom = (index) => {
    setRamRoms((current) => current.map((ramRom, ramRomIndex) => (
      ramRomIndex === index ? { ...ramRom, active: !ramRom.active } : ramRom
    )));
  };

  return (
    <div className="section-page ramrom-page" data-testid="ramrom-page">
      <h1>Item Management / RamRom</h1>
      {!isEditing ? (
        <section className="model-card" aria-label="RamRom list">
          <div className="model-toolbar">
            <input
              className="model-search"
              type="search"
              placeholder="Search RamRom"
              aria-label="Search RamRom"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="model-add-button" type="button" onClick={openAddForm}>
              Add RamRom
            </button>
          </div>
          <div className="model-table-wrap">
            <table className="model-table">
              <thead>
                <tr>
                  <th scope="col">RamRom Name</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Active/Inactive</th>
                </tr>
              </thead>
              <tbody>
                {filteredRamRoms.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="model-empty-state">
                      {ramRoms.length === 0 ? 'No RamRom entries available.' : 'No RamRom entries match your search.'}
                    </td>
                  </tr>
                ) : filteredRamRoms.map((ramRom) => (
                  <tr key={ramRom.index} className={!ramRom.active ? 'is-inactive' : ''}>
                    <td data-label="RamRom Name">{ramRom.name}</td>
                    <td data-label="Edit">
                      <button
                        className="model-icon-button model-edit-button"
                        type="button"
                        aria-label={`Edit ${ramRom.name}`}
                        onClick={() => openEditForm(ramRom.index)}
                      >
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </td>
                    <td data-label="Active/Inactive">
                      <button
                        className={`model-icon-button model-toggle-button${ramRom.active ? '' : ' is-inactive'}`}
                        type="button"
                        aria-label={`${ramRom.active ? 'Deactivate' : 'Activate'} ${ramRom.name}`}
                        onClick={() => toggleRamRom(ramRom.index)}
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
        <section className="model-card" aria-label={editingIndex === null ? 'Add RamRom' : 'Edit RamRom'}>
          <form className="model-form" onSubmit={saveRamRom} noValidate>
            <div className="model-form-field">
              <label htmlFor="ramrom-name">RamRom Name <span aria-hidden="true">*</span></label>
              <input
                id="ramrom-name"
                type="text"
                placeholder="RamRom Name"
                value={name}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'ramrom-name-error' : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  if (event.target.value.trim()) setError('');
                }}
              />
              {error && <span id="ramrom-name-error" className="required-field-error" role="alert">{error}</span>}
            </div>
            <div className="model-form-actions">
              <button className="model-save-button" type="submit">Save</button>
              <button className="model-cancel-button" type="button" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default RamRomPage;
