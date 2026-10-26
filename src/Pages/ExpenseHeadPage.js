import React, { useMemo, useState } from 'react';
import './ExpenseHeadPage.css';

function ExpenseHeadPage() {
  const [expenseHeads, setExpenseHeads] = useState([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const filteredExpenseHeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenseHeads
      .map((expenseHead, index) => ({ ...expenseHead, index }))
      .filter((expenseHead) => expenseHead.name.toLowerCase().includes(query));
  }, [expenseHeads, search]);

  const openAddForm = () => {
    setName('');
    setEditingIndex(null);
    setError('');
    setIsEditing(true);
  };

  const openEditForm = (index) => {
    setName(expenseHeads[index].name);
    setEditingIndex(index);
    setError('');
    setIsEditing(true);
  };

  const saveExpenseHead = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Expense Head Name is required.');
      return;
    }

    if (editingIndex === null) {
      setExpenseHeads((current) => [...current, { name: name.trim(), active: true }]);
    } else {
      setExpenseHeads((current) => current.map((expenseHead, index) => (
        index === editingIndex ? { ...expenseHead, name: name.trim() } : expenseHead
      )));
    }
    setIsEditing(false);
  };

  const toggleExpenseHead = (index) => {
    setExpenseHeads((current) => current.map((expenseHead, expenseHeadIndex) => (
      expenseHeadIndex === index
        ? { ...expenseHead, active: !expenseHead.active }
        : expenseHead
    )));
  };

  return (
    <div className="section-page expense-head-page" data-testid="expense-head-page">
      <h1>Setting / Expense Head</h1>
      {!isEditing ? (
        <section className="expense-head-card" aria-label="Expense Head list">
          <div className="expense-head-toolbar">
            <input
              className="expense-head-search"
              type="search"
              placeholder="Search Expense Head"
              aria-label="Search Expense Head"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="expense-head-add-button" type="button" onClick={openAddForm}>
              Add Expense Head
            </button>
          </div>
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
                {filteredExpenseHeads.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="expense-head-empty-state">
                      {expenseHeads.length === 0
                        ? 'No expense heads available.'
                        : 'No expense heads match your search.'}
                    </td>
                  </tr>
                ) : filteredExpenseHeads.map((expenseHead) => (
                  <tr key={expenseHead.index} className={!expenseHead.active ? 'is-inactive' : ''}>
                    <td data-label="Expense Head">{expenseHead.name}</td>
                    <td data-label="Edit">
                      <button
                        className="expense-head-icon-button expense-head-edit-button"
                        type="button"
                        aria-label={`Edit ${expenseHead.name}`}
                        onClick={() => openEditForm(expenseHead.index)}
                      >
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </td>
                    <td data-label="Active/Inactive">
                      <button
                        className={`expense-head-icon-button expense-head-toggle-button${expenseHead.active ? '' : ' is-inactive'}`}
                        type="button"
                        aria-label={`${expenseHead.active ? 'Deactivate' : 'Activate'} ${expenseHead.name}`}
                        onClick={() => toggleExpenseHead(expenseHead.index)}
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
            <div className="expense-head-form-field">
              <label htmlFor="expense-head-name">Expense Head Name <span aria-hidden="true">*</span></label>
              <input
                id="expense-head-name"
                type="text"
                placeholder="Expense Head Name"
                value={name}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'expense-head-name-error' : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  if (event.target.value.trim()) setError('');
                }}
              />
              {error && <span id="expense-head-name-error" className="required-field-error" role="alert">{error}</span>}
            </div>
            <div className="expense-head-form-actions">
              <button className="expense-head-save-button" type="submit">Save</button>
              <button className="expense-head-cancel-button" type="button" onClick={() => setIsEditing(false)}>
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
