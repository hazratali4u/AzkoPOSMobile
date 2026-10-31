import React, { useState } from 'react';
import '../css/SupplierPaymentPage.css';

function SupplierPaymentPage() {
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  return (
    <div className="section-page supplier-payment-page" data-testid="supplier-payment-page">
      <h1>Accounts / Supplier Payment</h1>

      {!isAddingPayment ? (
        <section className="supplier-payment-card" aria-label="Supplier payment list">
          <div className="supplier-payment-toolbar">
            <label className="page-search-wrap">
              <span className="page-search-icon" aria-hidden="true">⌕</span>
              <input
                className="page-search-input"
                type="search"
                placeholder="Search Supplier"
                aria-label="Search suppliers"
              />
            </label>
            <button
              className="supplier-payment-add-button"
              type="button"
              onClick={() => setIsAddingPayment(true)}
            >
              <span aria-hidden="true">＋</span> Add Payment
            </button>
          </div>

          <div className="supplier-payment-table-wrap">
            <table className="supplier-payment-table">
              <thead>
                <tr>
                  <th scope="col">Supplier Name</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Payment Date</th>
                  <th scope="col">Payment Mode</th>
                  <th scope="col">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" className="supplier-payment-empty-state">
                    <span className="supplier-payment-empty-icon" aria-hidden="true">▤</span>
                    <strong>No payments yet</strong>
                    <span>Supplier payments will appear here.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="supplier-payment-card supplier-payment-form-card" aria-label="Add supplier payment">
          <div className="supplier-payment-form-layout">
            <div className="supplier-payment-fields">
              <div className="supplier-payment-field">
                <label htmlFor="supplier-payment-date">Payment Date</label>
                <input id="supplier-payment-date" type="date" />
              </div>

              <div className="supplier-payment-field">
                <label htmlFor="supplier-payment-supplier">Supplier</label>
                <select id="supplier-payment-supplier" defaultValue="">
                  <option value="" disabled>Select Supplier</option>
                </select>
              </div>

              <div className="supplier-payment-field">
                <label htmlFor="supplier-payment-amount">Amount Paid <span aria-hidden="true">*</span></label>
                <input id="supplier-payment-amount" type="text" inputMode="decimal" placeholder="0.00" />
              </div>

              <div className="supplier-payment-field">
                <label htmlFor="supplier-payment-mode">Payment Mode</label>
                <select id="supplier-payment-mode" defaultValue="cash">
                  <option value="cash">Cash</option>
                  <option value="online">Online Transfer</option>
                </select>
              </div>

              <div className="supplier-payment-field">
                <label htmlFor="supplier-payment-reference">Reference #</label>
                <input id="supplier-payment-reference" type="text" placeholder="Reference #" />
              </div>

              <div className="supplier-payment-field">
                <label htmlFor="supplier-payment-remarks">Remarks</label>
                <input id="supplier-payment-remarks" type="text" placeholder="Remarks" />
              </div>
            </div>

            <aside className="supplier-payment-credit-panel" aria-label="Supplier credit">
              <div className="supplier-payment-table-wrap">
                <table className="supplier-payment-table supplier-credit-table">
                  <thead>
                    <tr>
                      <th scope="col">Purchase ID</th>
                      <th scope="col">Purchase Date</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="3" className="supplier-credit-empty">
                        Credit purchases will appear here.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="supplier-payment-credit-total">
                <label htmlFor="supplier-payment-total-credit">Total Credit</label>
                <input id="supplier-payment-total-credit" type="text" value="0.00" readOnly />
              </div>
            </aside>
          </div>

          <div className="supplier-payment-form-actions">
            <button className="supplier-payment-save-button" type="button">Save</button>
            <button
              className="supplier-payment-cancel-button"
              type="button"
              onClick={() => setIsAddingPayment(false)}
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default SupplierPaymentPage;
