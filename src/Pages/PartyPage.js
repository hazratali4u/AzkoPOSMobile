import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../UserContext';
import './PartyPage.css';

const emptyParty = {
  partyID: '',
  partyType: 2,
  partyName: '',
  address: '',
  contactNo: '',
  active: true,
};

function PartyPage() {
  const user = useUser();
  const connString = user && user.connString;
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [formParty, setFormParty] = useState(emptyParty);
  const [isAddingParty, setIsAddingParty] = useState(false);
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

    async function loadParties() {
      setParties([]);
      if (typeof connString !== 'string' || !connString.trim()) {
        setLoadError('Unable to load parties.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch('https://api.azkopos.com/Party/GetAllPartyData?TypeID=1', {
          method: 'GET',
          headers: {
            ConnectionString: connString,
          },
        });

        if (!response.ok) {
          throw new Error('Party request failed.');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.some((item) => (
          !item
          || !Number.isFinite(item.partyID)
          || typeof item.name !== 'string'
          || typeof item.address !== 'string'
          || typeof item.contactNo !== 'string'
          || !['Customer', 'Supplier'].includes(item.partyType)
          || typeof item.status !== 'string'
        ))) {
          throw new Error('Party response is invalid.');
        }

        if (isActive) {
          setParties(data.map((item) => ({
            partyID: item.partyID,
            partyType: item.partyType === 'Customer' ? 1 : 2,
            partyName: item.name,
            address: item.address,
            contactNo: item.contactNo,
            active: item.status.toLowerCase() === 'active',
          })));
        }
      } catch {
        if (isActive) {
          setLoadError('Unable to load parties. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadParties();
    return () => {
      isActive = false;
    };
  }, [connString, reloadKey]);

  const filteredParties = useMemo(() => {
    const query = search.trim().toLowerCase();
    return parties
      .map((party, index) => ({ ...party, index }))
      .filter((party) => `${party.partyName} ${party.address} ${party.contactNo}`
        .toLowerCase().includes(query));
  }, [search, parties]);

  const openAddForm = () => {
    setFormParty(emptyParty);
    setEditingIndex(null);
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingParty(true);
  };

  const cancelForm = () => {
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingParty(false);
  };

  const saveParty = async (event) => {
    event.preventDefault();
    setSaveError('');
    setSaveMessage('');
    const nextErrors = {
      partyName: formParty.partyName.trim() ? '' : 'Party Name is required.',
      address: formParty.address.trim() ? '' : 'Address is required.',
      contactNo: formParty.contactNo.trim() ? '' : 'Contact Number is required.',
      partyType: [1, 2].includes(formParty.partyType) ? '' : 'Party Type is required.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || (editingIndex !== null && !Number.isFinite(formParty.partyID))
    ) {
      setSaveError('Unable to save party.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('https://api.azkopos.com/Party/InsertUpdateParty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          PartyID: editingIndex === null ? 0 : formParty.partyID,
          Name: formParty.partyName.trim(),
          Address: formParty.address.trim(),
          ContactNo: formParty.contactNo.trim(),
          PartyType: formParty.partyType,
          UserID: user.userID,
          TypeID: editingIndex === null ? 1 : 2,
        }),
      });

      if (!response.ok) {
        throw new Error('Party save request failed.');
      }

      setSaveMessage('Party saved successfully.');
      setIsAddingParty(false);
      setReloadKey((key) => key + 1);
    } catch {
      setSaveError('Unable to save party. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const editParty = (index) => {
    setFormParty({ ...parties[index] });
    setEditingIndex(index);
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingParty(true);
  };

  const toggleParty = async (index) => {
    const selectedParty = parties[index];
    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || !Number.isFinite(selectedParty && selectedParty.partyID)
    ) {
      setSaveError('Unable to update party status.');
      return;
    }

    setSaveError('');
    setSaveMessage('');
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('https://api.azkopos.com/Party/InsertUpdateParty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          PartyID: selectedParty.partyID,
          Name: selectedParty.partyName,
          Address: selectedParty.address,
          ContactNo: selectedParty.contactNo,
          PartyType: selectedParty.partyType,
          UserID: user.userID,
          TypeID: selectedParty.active ? 3 : 4,
        }),
      });

      if (!response.ok) {
        throw new Error('Party status request failed.');
      }

      setParties((currentParties) => currentParties.map((currentParty) => (
        currentParty.partyID === selectedParty.partyID
          ? { ...currentParty, active: !selectedParty.active }
          : currentParty
      )));
      setSaveMessage('Party status updated successfully.');
    } catch {
      setSaveError('Unable to update party status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="section-page party-page" data-testid="party-page">
      <h1>Setting / Party</h1>
      {!isAddingParty ? (
        <section className="party-card" aria-label="Party list">
          <div className="party-toolbar">
            <input
              className="party-search"
              type="search"
              placeholder="Search Party"
              aria-label="Search Party"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="party-add-button" type="button" onClick={openAddForm}>Add Party</button>
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
          <div className="party-table-wrap">
            <table className="party-table">
              <thead>
                <tr>
                  <th scope="col">Party Name</th>
                  <th scope="col">Address</th>
                  <th scope="col">Contact No</th>
                  <th scope="col">Party Type</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Active/Inactive</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="party-empty-state" role="status">Loading parties...</td>
                  </tr>
                ) : filteredParties.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="party-empty-state">
                      {parties.length === 0 ? 'No parties available.' : 'No parties match your search.'}
                    </td>
                  </tr>
                ) : filteredParties.map((party) => (
                  <tr key={party.partyID || party.index} className={!party.active ? 'is-inactive' : ''}>
                    <td data-label="Party Name">{party.partyName}</td>
                    <td data-label="Address">{party.address}</td>
                    <td data-label="Contact No">{party.contactNo}</td>
                    <td data-label="Party Type">
                      {party.partyType === 1 ? 'Customer' : 'Supplier'}
                    </td>
                    <td data-label="Edit">
                      <button
                        className="user-icon-button user-edit-button"
                        type="button"
                        aria-label={`Edit ${party.partyName}`}
                        onClick={() => editParty(party.index)}
                      >
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </td>
                    <td data-label="Active/Inactive">
                      <button
                        className={`user-icon-button user-toggle-button${party.active ? '' : ' is-inactive'}`}
                        type="button"
                        aria-label={`${party.active ? 'Deactivate' : 'Activate'} ${party.partyName}`}
                        onClick={() => toggleParty(party.index)}
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
        <section className="party-card" aria-label={editingIndex === null ? 'Add Party' : 'Edit Party'}>
          <form className="party-form" onSubmit={saveParty} noValidate>
            {saveError && <div role="alert">{saveError}</div>}
            <fieldset
              className="party-type-options"
              aria-invalid={Boolean(errors.partyType)}
              aria-describedby={errors.partyType ? 'party-type-error' : undefined}
            >
              <legend>Party Type</legend>
              <label>
                <input
                  type="radio"
                  name="partyType"
                  value="1"
                  checked={formParty.partyType === 1}
                  disabled={editingIndex !== null}
                  onChange={(event) => {
                    setFormParty({ ...formParty, partyType: Number(event.target.value) });
                    setErrors((current) => ({ ...current, partyType: '' }));
                  }}
                />
                Customer
              </label>
              <label>
                <input
                  type="radio"
                  name="partyType"
                  value="2"
                  checked={formParty.partyType === 2}
                  disabled={editingIndex !== null}
                  onChange={(event) => {
                    setFormParty({ ...formParty, partyType: Number(event.target.value) });
                    setErrors((current) => ({ ...current, partyType: '' }));
                  }}
                />
                Supplier
              </label>
            </fieldset>
            {errors.partyType && <div id="party-type-error" className="required-field-error" role="alert">{errors.partyType}</div>}
            <div className="party-form-field">
              <label htmlFor="party-name">Party Name <span aria-hidden="true">*</span></label>
              <input
                id="party-name"
                type="text"
                placeholder="Party Name"
                value={formParty.partyName}
                aria-invalid={Boolean(errors.partyName)}
                aria-describedby={errors.partyName ? 'party-name-error' : undefined}
                onChange={(event) => {
                  const partyName = event.target.value;
                  setFormParty({ ...formParty, partyName });
                  if (partyName.trim()) setErrors((current) => ({ ...current, partyName: '' }));
                }}
              />
              {errors.partyName && <span id="party-name-error" className="required-field-error" role="alert">{errors.partyName}</span>}
            </div>
            <div className="party-form-field">
              <label htmlFor="party-address">Address <span aria-hidden="true">*</span></label>
              <input
                id="party-address"
                type="text"
                placeholder="Party Address"
                value={formParty.address}
                aria-invalid={Boolean(errors.address)}
                aria-describedby={errors.address ? 'party-address-error' : undefined}
                onChange={(event) => {
                  const address = event.target.value;
                  setFormParty({ ...formParty, address });
                  if (address.trim()) setErrors((current) => ({ ...current, address: '' }));
                }}
              />
              {errors.address && <span id="party-address-error" className="required-field-error" role="alert">{errors.address}</span>}
            </div>
            <div className="party-form-field">
              <label htmlFor="party-contact">Contact No <span aria-hidden="true">*</span></label>
              <input
                id="party-contact"
                type="text"
                placeholder="Party Contact No"
                value={formParty.contactNo}
                aria-invalid={Boolean(errors.contactNo)}
                aria-describedby={errors.contactNo ? 'party-contact-error' : undefined}
                onChange={(event) => {
                  const contactNo = event.target.value;
                  setFormParty({ ...formParty, contactNo });
                  if (contactNo.trim()) setErrors((current) => ({ ...current, contactNo: '' }));
                }}
              />
              {errors.contactNo && <span id="party-contact-error" className="required-field-error" role="alert">{errors.contactNo}</span>}
            </div>
            <div className="party-form-actions">
              <button className="shop-save-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="shop-cancel-button"
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

export default PartyPage;
