import React, {useEffect, useMemo, useState } from 'react';
import { useUser } from '../UserContext';
import '../css/ExpenseHeadPage.css';
const emptyExpenseHead = {
  expenseHeadID: '',
  expenseHeadName: '',
  active: true,
};

function ExpenseHeadPage() {
  const user = useUser();
    const connString = user && user.connString;
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [search, setSearch] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [formExpenseHead, setFormExpenseHead] = useState(emptyExpenseHead);
  const [isAddingExpenseHead, setIsAddingExpenseHead] = useState(false);
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
      async function loadExpenseHeads() {
        setExpenseHeads([]);
        if (typeof connString !== 'string' || !connString.trim()) {
          setLoadError('Unable to load expenseheads.');
          setIsLoading(false);
          return;
        }
  
        setIsLoading(true);
        setLoadError('');  
        try {
          const response = await fetch('https://api.azkopos.com/ExpenseHead/GetAllExpenseHeadData?TypeID=1', {
            method: 'GET',
            headers: {
              ConnectionString: connString,
            },
          });
  
          if (!response.ok) {
            throw new Error('Expense Head request failed.');
          }
  
          const data = await response.json();
          if (!Array.isArray(data) || data.some((item) => (
            !item
            || !Number.isFinite(item.expenseHeadID)
            || typeof item.name !== 'string'
            || typeof item.status !== 'string'
          ))) {
            throw new Error('Expense Head response is invalid.');
          }
  
          if (isActive) {
            setExpenseHeads(data.map((item) => ({
              expenseHeadID: item.expenseHeadID,
              expenseHeadName: item.name,
              active: item.status.toLowerCase() === 'active',
            })));
          }
        } catch {
          if (isActive) {
            setLoadError('Unable to load expenseheads. Please try again.');
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }
  
      loadExpenseHeads();
      return () => {
        isActive = false;
      };
    }, [connString, reloadKey]);

    const filteredExpenseHeads = useMemo(() => {
        const query = search.trim().toLowerCase();
        return expenseHeads
          .map((expenseHead, index) => ({ ...expenseHead, index }))
          .filter((expenseHead) => `${expenseHead.expenseHeadName}`
            .toLowerCase().includes(query));
      }, [search, expenseHeads]);

const openAddForm = () => {
    setFormExpenseHead(emptyExpenseHead);
    setEditingIndex(null);
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingExpenseHead(true);
  };

    const cancelForm = () => {
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingExpenseHead(false);
  };

const saveExpenseHead = async (event) => {
    event.preventDefault();
    setSaveError('');
    setSaveMessage('');
    const nextErrors = {
      expenseHeadName: formExpenseHead.expenseHeadName.trim() ? '' : 'Expense Head Name is required.',      
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || (editingIndex !== null && !Number.isFinite(formExpenseHead.expenseHeadID))
    ) {
      setSaveError('Unable to save expense head.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('https://api.azkopos.com/ExpenseHead/InsertUpdateExpenseHead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          ExpenseHeadID: editingIndex === null ? 0 : formExpenseHead.expenseHeadID,
          Name: formExpenseHead.expenseHeadName.trim(),
          UserID: user.userID,
          TypeID: editingIndex === null ? 1 : 2,
        }),
      });

      if (!response.ok) {
        throw new Error('Expense Head save request failed.');
      }

      setSaveMessage('Expense Head saved successfully.');
      setIsAddingExpenseHead(false);
      setReloadKey((key) => key + 1);
    } catch {
      setSaveError('Unable to save expensehead. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const editExpenseHead = (index) => {
    setFormExpenseHead({ ...expenseHeads[index] });
    setEditingIndex(index);
    setErrors({});
    setSaveError('');
    setSaveMessage('');
    setIsAddingExpenseHead(true);
  };
  
  const toggleExpenseHead = async (index) => {
    const selectedExpenseHead = expenseHeads[index];
    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || !Number.isFinite(selectedExpenseHead && selectedExpenseHead.expenseHeadID)
    ) {
      setSaveError('Unable to update expensehead status.');
      return;
    }

    setSaveError('');
    setSaveMessage('');
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('https://api.azkopos.com/ExpenseHead/InsertUpdateExpenseHead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          ExpenseHeadID: selectedExpenseHead.expenseHeadID,
          Name: selectedExpenseHead.expenseHeadName,
          UserID: user.userID,
          TypeID: selectedExpenseHead.active ? 3 : 4,
        }),
      });

      if (!response.ok) {
        throw new Error('Expense Head status request failed.');
      }

      setExpenseHeads((currentExpenseHeads) => currentExpenseHeads.map((currentExpenseHead) => (
        currentExpenseHead.expenseHeadID === selectedExpenseHead.expenseHeadID
          ? { ...currentExpenseHead, active: !selectedExpenseHead.active }
          : currentExpenseHead
      )));
      setSaveMessage('Expense Head status updated successfully.');
    } catch {
      setSaveError('Unable to update expensehead status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="section-page expense-head-page" data-testid="expense-head-page">
      <h1>Setting / Expense Head</h1>
      {!isAddingExpenseHead ? (
        <section className="expense-head-card" aria-label="Expense Head list">
          <div className="expense-head-toolbar">
            <label className="page-search-wrap">
              <span className="page-search-icon" aria-hidden="true">⌕</span>
              <input
                className="page-search-input"
                type="search"
                placeholder="Search Expense Head"
                aria-label="Search Expense Head"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <button className="expense-head-add-button" type="button" onClick={openAddForm}>
              <span aria-hidden="true">＋</span> Add Expense Head
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
          <div className="expense-head-table-wrap">
            <table className="expense-head-table">
              <thead>
                <tr>
                  <th scope="col">Expense Head Name</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Active/Inactive</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="expense-head-empty-state" role="status">Loading expense heads...</td>
                  </tr>
                ) : filteredExpenseHeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="expense-head-empty-state">
                      {expenseHeads.length === 0 ? 'No expense heads available.' : 'No expense heads match your search.'}
                    </td>
                  </tr>
                ) : filteredExpenseHeads.map((expensehead) => (
                  <tr key={expensehead.expenseHeadID || expensehead.index} className={!expensehead.active ? 'is-inactive' : ''}>
                    <td data-label="Expense Head Name">{expensehead.expenseHeadName}</td>
                    <td data-label="Edit">
                      <button
                        className="user-icon-button user-edit-button"
                        type="button"
                        aria-label={`Edit ${expensehead.expenseHeadName}`}
                        onClick={() => editExpenseHead(expensehead.index)}
                      >
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </td>
                    <td data-label="Active/Inactive">
                      <button
                        className={`user-icon-button user-toggle-button${expensehead.active ? '' : ' is-inactive'}`}
                        type="button"
                        aria-label={`${expensehead.active ? 'Deactivate' : 'Activate'} ${expensehead.expenseHeadName}`}
                        onClick={() => toggleExpenseHead(expensehead.index)}
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
        <section className="expense-head-card" aria-label={editingIndex === null ? 'Add Expense Head' : 'Edit Expense Head'}>
          <form className="expense-head-form" onSubmit={saveExpenseHead} noValidate>
            {saveError && <div role="alert">{saveError}</div>}
            <div className="expense-head-form-field">
              <label htmlFor="expense-head-name">Expense Head Name <span aria-hidden="true">*</span></label>
              <input
                id="expense-head-name"
                type="text"
                placeholder="Expense Head Name"
                value={formExpenseHead.expenseHeadName}
                aria-invalid={Boolean(errors.expenseHeadName)}
                aria-describedby={errors.expenseHeadName ? 'expense-head-name-error' : undefined}
                onChange={(event) => {
                  const expenseHeadName = event.target.value;
                  setFormExpenseHead({ ...formExpenseHead, expenseHeadName });
                  if (expenseHeadName.trim()) setErrors((current) => ({ ...current, expenseHeadName: '' }));
                }}
              />
              {errors.expenseHeadName && <span id="expense-head-name-error" className="required-field-error" role="alert">{errors.expenseHeadName}</span>}
            </div>
            <div className="expense-head-form-actions">
              <button className="expense-head-save-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="expense-head-cancel-button"
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

export default ExpenseHeadPage;
