import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../UserContext';
import '../css/ModelPage.css';

function RamRomPage() {
  const user = useUser();
  const connString = user && user.connString;
  const [ramRoms, setRamRoms] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(connString));
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadRamRoms() {
      setRamRoms([]);
      if (typeof connString !== 'string' || !connString.trim()) {
        setLoadError('Unable to load RamRom entries.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch('https://api.azkopos.com/RamRom/GetAllRamRomData?TypeID=1', {
          method: 'GET',
          headers: {
            ConnectionString: connString,
          },
        });

        if (!response.ok) {
          throw new Error('RamRom request failed.');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.some((item) => (
          !item
          || !Number.isFinite(item.ramRomID)
          || typeof item.name !== 'string'
          || typeof item.status !== 'string'
        ))) {
          throw new Error('RamRom response is invalid.');
        }

        if (isActive) {
          setRamRoms(data.map((item) => ({
            ramRomID: item.ramRomID,
            name: item.name,
            active: item.status.toLowerCase() === 'active',
          })));
        }
      } catch {
        if (isActive) {
          setLoadError('Unable to load RamRom entries. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadRamRoms();
    return () => {
      isActive = false;
    };
  }, [connString, reloadKey]);

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
    setSaveError('');
    setSaveMessage('');
    setIsEditing(true);
  };

  const openEditForm = (index) => {
    setName(ramRoms[index].name);
    setEditingIndex(index);
    setError('');
    setSaveError('');
    setSaveMessage('');
    setIsEditing(true);
  };

  const saveRamRom = async (event) => {
    event.preventDefault();
    setSaveError('');
    setSaveMessage('');
    if (!name.trim()) {
      setError('RamRom Name is required.');
      return;
    }

    const ramRomID = editingIndex === null ? 0 : ramRoms[editingIndex].ramRomID;
    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(ramRomID)
    ) {
      setSaveError('Unable to save RamRom entry.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('https://api.azkopos.com/RamRom/InsertUpdateRamRom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          RamRomID: ramRomID,
          Name: name.trim(),
          TypeID: editingIndex === null ? 1 : 2,
        }),
      });

      if (!response.ok) {
        throw new Error('RamRom save request failed.');
      }

      setSaveMessage('RamRom entry saved successfully.');
      setIsEditing(false);
      setReloadKey((key) => key + 1);
    } catch {
      setSaveError('Unable to save RamRom entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRamRom = async (index) => {
    const selectedRamRom = ramRoms[index];
    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(selectedRamRom && selectedRamRom.ramRomID)
    ) {
      setSaveError('Unable to update RamRom status.');
      setSaveMessage('');
      return;
    }

    setSaveError('');
    setSaveMessage('');
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('https://api.azkopos.com/RamRom/InsertUpdateRamRom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          RamRomID: selectedRamRom.ramRomID,
          Name: selectedRamRom.name,
          TypeID: selectedRamRom.active ? 3 : 4,
        }),
      });

      if (!response.ok) {
        throw new Error('RamRom status request failed.');
      }

      setRamRoms((currentRamRoms) => currentRamRoms.map((ramRom) => (
        ramRom.ramRomID === selectedRamRom.ramRomID
          ? { ...ramRom, active: !selectedRamRom.active }
          : ramRom
      )));
      setSaveMessage('RamRom status updated successfully.');
    } catch {
      setSaveError('Unable to update RamRom status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="section-page ramrom-page" data-testid="ramrom-page">
      <h1>Item Management / RamRom</h1>
      {!isEditing ? (
        <section className="model-card" aria-label="RamRom list">
          <div className="model-toolbar">
            <label className="page-search-wrap">
              <span className="page-search-icon" aria-hidden="true">⌕</span>
              <input
                className="page-search-input"
                type="search"
                placeholder="Search RamRom"
                aria-label="Search RamRom"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <button className="model-add-button" type="button" onClick={openAddForm}>
              <span aria-hidden="true">＋</span> Add RamRom
            </button>
          </div>
          {loadError && (
            <div role="alert">
              {loadError}{' '}
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
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="model-empty-state" role="status">
                      Loading RamRom entries...
                    </td>
                  </tr>
                ) : filteredRamRoms.length === 0 ? (
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
        <section className="model-card" aria-label={editingIndex === null ? 'Add RamRom' : 'Edit RamRom'}>
          <form className="model-form" onSubmit={saveRamRom} noValidate>
            {saveError && <div role="alert">{saveError}</div>}
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
              <button className="model-save-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="model-cancel-button"
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSaveError('');
                }}
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

export default RamRomPage;
