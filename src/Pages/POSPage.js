import React, { useState } from 'react';
import '../css/POSPage.css';

function POSPage() {
  const [isAddingSale, setIsAddingSale] = useState(false);

  return (
    <div className="section-page pos-page" data-testid="pos-page">
      <h1>Transactions / POS</h1>

      {!isAddingSale ? (
        <section className="pos-card" aria-label="Sales list">
          <div className="pos-toolbar">
            <label className="page-search-wrap">
              <span className="page-search-icon" aria-hidden="true">⌕</span>
              <input
                className="page-search-input"
                type="search"
                placeholder="Search Sale"
                aria-label="Search sales"
              />
            </label>
            <button className="pos-add-button" type="button" onClick={() => setIsAddingSale(true)}>
              <span aria-hidden="true">＋</span> Add Sale
            </button>
          </div>

          <div className="pos-table-wrap">
            <table className="pos-table">
              <thead>
                <tr>
                  <th scope="col">Sale ID</th>
                  <th scope="col">Party Type</th>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Total Amount</th>
                  <th scope="col">Item</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" className="pos-empty-state" role="status">
                    <span className="pos-empty-icon" aria-hidden="true">▤</span>
                    <strong>No sales yet</strong>
                    <span>Recorded sales will appear here.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="pos-card pos-entry-card" aria-label="Add sale">
          <div className="pos-form-section">
            <h2>Sale Information</h2>
            <div className="pos-customer-grid">
              <div className="pos-field pos-customer-select">
                <label htmlFor="pos-customer">Customer <span aria-hidden="true">*</span></label>
                <select id="pos-customer" defaultValue="">
                  <option value="" disabled>Select Customer</option>
                </select>
              </div>
              <div className="pos-field">
                <label htmlFor="pos-customer-name">Customer Name</label>
                <input id="pos-customer-name" type="text" placeholder="Walking Customer Name" />
              </div>
              <div className="pos-field">
                <label htmlFor="pos-customer-contact">Customer Contact No</label>
                <input id="pos-customer-contact" type="tel" placeholder="Customer Contact No" />
              </div>
              <div className="pos-field">
                <label htmlFor="pos-bill-book">Bill Book No</label>
                <input id="pos-bill-book" type="text" placeholder="Bill Book No" />
              </div>
              <div className="pos-field">
                <label htmlFor="pos-sale-date">Sale Date</label>
                <input id="pos-sale-date" type="text" placeholder="DD-MMM-YYYY" />
              </div>
            </div>
          </div>

          <div className="pos-form-section">
            <h2>Sale Items</h2>
            <div className="pos-item-search-grid">
              <div className="pos-field">
                <label htmlFor="pos-search-item">Search Item</label>
                <div className="page-search-wrap">
                  <span className="page-search-icon" aria-hidden="true">⌕</span>
                  <input
                    id="pos-search-item"
                    className="page-search-input"
                    type="search"
                    placeholder="Search Model, RamRom, IMEI"
                  />
                </div>
              </div>
              <div className="pos-field">
                <label htmlFor="pos-scan-imei">Scan IMEI</label>
                <input id="pos-scan-imei" type="text" placeholder="Scan IMEI" />
              </div>
            </div>

            <div className="pos-detail-wrap">
              <table className="pos-table pos-detail-table">
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">IMEI</th>
                    <th scope="col">Sale Price</th>
                    <th scope="col">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="pos-detail-empty" role="status">
                      Items added to this sale will appear here.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pos-payment-fields">
            <div className="pos-field">
              <label htmlFor="pos-cash-amount">Cash Amount</label>
              <input id="pos-cash-amount" type="text" inputMode="decimal" defaultValue="0" />
            </div>
            <div className="pos-field">
              <label htmlFor="pos-online-amount">Online Transfer Amount</label>
              <input id="pos-online-amount" type="text" inputMode="decimal" defaultValue="0" />
            </div>
          </div>

          <div className="pos-form-actions">
            <button className="pos-save-button" type="button">Save</button>
            <button className="pos-cancel-button" type="button" onClick={() => setIsAddingSale(false)}>Cancel</button>
          </div>
        </section>
      )}
    </div>
  );
}

export default POSPage;
