import React, { useState } from 'react';

function PartyPage() {
  const [isAddingParty, setIsAddingParty] = useState(false);
  const [partyType, setPartyType] = useState('2');
  const [partyName, setPartyName] = useState('');
  const [partyNameError, setPartyNameError] = useState('');

  const saveParty = (event) => {
    event.preventDefault();
    setPartyNameError(partyName.trim() ? '' : 'Party Name is required.');
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
            />
            <button
              className="party-add-button"
              type="button"
              onClick={() => {
                setPartyName('');
                setPartyNameError('');
                setIsAddingParty(true);
              }}
            >
              Add Party
            </button>
          </div>
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
                <tr>
                  <td colSpan="6" className="party-empty-state">No parties available.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="party-card" aria-label="Add party">
          <form className="party-form" noValidate onSubmit={saveParty}>
            <fieldset className="party-type-options">
              <legend>Party Type</legend>
              <label>
                <input
                  type="radio"
                  name="partyType"
                  value="1"
                  checked={partyType === '1'}
                  onChange={(event) => setPartyType(event.target.value)}
                />
                Customer
              </label>
              <label>
                <input
                  type="radio"
                  name="partyType"
                  value="2"
                  checked={partyType === '2'}
                  onChange={(event) => setPartyType(event.target.value)}
                />
                Supplier
              </label>
            </fieldset>
            <div className="party-form-field">
              <label htmlFor="party-name">Party Name <span aria-hidden="true">*</span></label>
              <input
                id="party-name"
                type="text"
                placeholder="Party Name"
                value={partyName}
                aria-invalid={Boolean(partyNameError)}
                aria-describedby={partyNameError ? 'party-name-error' : undefined}
                onChange={(event) => {
                  setPartyName(event.target.value);
                  if (event.target.value.trim()) setPartyNameError('');
                }}
              />
              {partyNameError && <span id="party-name-error" className="required-field-error" role="alert">{partyNameError}</span>}
            </div>
            <div className="party-form-field">
              <label htmlFor="party-address">Address</label>
              <input id="party-address" type="text" placeholder="Party Address" />
            </div>
            <div className="party-form-field">
              <label htmlFor="party-contact">Contact No</label>
              <input id="party-contact" type="text" placeholder="Party Contact No" />
            </div>
            <div className="party-form-actions">
              <button className="shop-save-button" type="submit">Save</button>
              <button
                className="shop-cancel-button"
                type="button"
                onClick={() => setIsAddingParty(false)}
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
