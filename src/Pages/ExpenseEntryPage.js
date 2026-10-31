import React, { useState } from 'react';
import '../css/ExpenseEntryPage.css';

function ExpenseEntryPage() {
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  return (
    <div className="section-page expense-entry-page" data-testid="expense-entry-page">
      <h1>Accounts / Expense Entry</h1>

      {!isAddingExpense ? (
        <section className="expense-entry-card" aria-label="Expense list">
          <div className="expense-entry-toolbar">
            <label className="page-search-wrap">
              <span className="page-search-icon" aria-hidden="true">⌕</span>
              <input
                className="page-search-input"
                type="search"
                placeholder="Search Expense"
                aria-label="Search expenses"
              />
            </label>
            <button
              className="expense-entry-add-button"
              type="button"
              onClick={() => setIsAddingExpense(true)}
            >
              <span aria-hidden="true">＋</span> Add Expense
            </button>
          </div>

          <div className="expense-entry-table-wrap">
            <table className="expense-entry-table">
              <thead>
                <tr>
                  <th scope="col">Expense Date</th>
                  <th scope="col">Expense Name</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Remarks</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className="expense-entry-empty-state">
                    <span className="expense-entry-empty-icon" aria-hidden="true">▤</span>
                    <strong>No expenses yet</strong>
                    <span>Recorded expenses will appear here.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="expense-entry-card expense-entry-form-card" aria-label="Add expense">
          <div className="expense-entry-form-grid">
            <div className="expense-entry-field">
              <label htmlFor="expense-entry-date">Expense Date</label>
              <input id="expense-entry-date" type="date" />
            </div>

            <div className="expense-entry-field">
              <label htmlFor="expense-entry-head">Expense Head <span aria-hidden="true">*</span></label>
              <select id="expense-entry-head" defaultValue="">
                <option value="" disabled>Select Expense Head</option>
              </select>
            </div>

            <div className="expense-entry-field">
              <label htmlFor="expense-entry-amount">Expense Amount <span aria-hidden="true">*</span></label>
              <input id="expense-entry-amount" type="text" inputMode="decimal" placeholder="Expense Amount" />
            </div>

            <div className="expense-entry-field">
              <label htmlFor="expense-entry-remarks">Remarks</label>
              <input id="expense-entry-remarks" type="text" placeholder="Remarks" />
            </div>
          </div>

          <div className="expense-entry-form-actions">
            <button className="expense-entry-save-button" type="button">Save</button>
            <button
              className="expense-entry-cancel-button"
              type="button"
              onClick={() => setIsAddingExpense(false)}
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default ExpenseEntryPage;
