import React, { useState } from 'react';
import '../css/CustomerReceiptPage.css';

function CustomerReceiptPage() {
  const [isAddingReceipt, setIsAddingReceipt] = useState(false);

  return (
    <div className="section-page customer-receipt-page" data-testid="customer-receipt-page">
      <h1>Accounts / Customer Receipt</h1>

      {!isAddingReceipt ? (
        <section className="customer-receipt-card" aria-label="Customer receipt list">
          <div className="customer-receipt-toolbar">
            <label className="page-search-wrap">
              <span className="page-search-icon" aria-hidden="true">⌕</span>
              <input
                className="page-search-input"
                type="search"
                placeholder="Search Customer"
                aria-label="Search customers"
              />
            </label>
            <button
              className="customer-receipt-add-button"
              type="button"
              onClick={() => setIsAddingReceipt(true)}
            >
              <span aria-hidden="true">＋</span> Add Receipt
            </button>
          </div>

          <div className="customer-receipt-table-wrap">
            <table className="customer-receipt-table">
              <thead>
                <tr>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Payment Date</th>
                  <th scope="col">Payment Mode</th>
                  <th scope="col">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" className="customer-receipt-empty-state">
                    <span className="customer-receipt-empty-icon" aria-hidden="true">▤</span>
                    <strong>No receipts yet</strong>
                    <span>Customer receipts will appear here.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="customer-receipt-card customer-receipt-form-card" aria-label="Add customer receipt">
          <div className="customer-receipt-form-layout">
            <div className="customer-receipt-fields">
              <div className="customer-receipt-field">
                <label htmlFor="receipt-date">Receipt Date</label>
                <input id="receipt-date" type="date" />
              </div>

              <div className="customer-receipt-field">
                <label htmlFor="receipt-customer">Customer</label>
                <select id="receipt-customer" defaultValue="">
                  <option value="" disabled>Select Customer</option>
                </select>
              </div>

              <div className="customer-receipt-field">
                <label htmlFor="receipt-amount">Amount Received <span aria-hidden="true">*</span></label>
                <input id="receipt-amount" type="text" inputMode="decimal" placeholder="0.00" />
              </div>

              <div className="customer-receipt-field">
                <label htmlFor="receipt-payment-mode">Payment Mode</label>
                <select id="receipt-payment-mode" defaultValue="cash">
                  <option value="cash">Cash</option>
                  <option value="online">Online Transfer</option>
                </select>
              </div>

              <div className="customer-receipt-field">
                <label htmlFor="receipt-reference">Reference #</label>
                <input id="receipt-reference" type="text" placeholder="Reference #" />
              </div>

              <div className="customer-receipt-field">
                <label htmlFor="receipt-remarks">Remarks</label>
                <input id="receipt-remarks" type="text" placeholder="Remarks" />
              </div>
            </div>

            <aside className="customer-receipt-credit-panel" aria-label="Customer credit">
              <div className="customer-receipt-table-wrap">
                <table className="customer-receipt-table customer-credit-table">
                  <thead>
                    <tr>
                      <th scope="col">Sale ID</th>
                      <th scope="col">Sale Date</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="3" className="customer-credit-empty">
                        Credit sales will appear here.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="customer-receipt-credit-total">
                <label htmlFor="receipt-total-credit">Total Credit</label>
                <input id="receipt-total-credit" type="text" value="0.00" readOnly />
              </div>
            </aside>
          </div>

          <div className="customer-receipt-form-actions">
            <button className="customer-receipt-save-button" type="button">Save</button>
            <button
              className="customer-receipt-cancel-button"
              type="button"
              onClick={() => setIsAddingReceipt(false)}
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default CustomerReceiptPage;
