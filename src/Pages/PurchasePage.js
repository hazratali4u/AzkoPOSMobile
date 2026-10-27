import React, { useState } from 'react';
import '../css/PurchasePage.css';

function PurchasePage() {
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);

  return (
    <div className="section-page purchase-page" data-testid="purchase-page">
      <div className="purchase-page-heading">
        <div>
          <p className="purchase-breadcrumb">Transactions / Purchase</p>
          <h1>Purchase Management</h1>
          <p className="purchase-page-description">Record purchases and keep track of incoming inventory.</p>
        </div>
        {!isAddingPurchase && (
          <button className="purchase-primary-button" type="button" onClick={() => setIsAddingPurchase(true)}>
            <span aria-hidden="true">＋</span> Add Purchase
          </button>
        )}
      </div>

      {!isAddingPurchase ? (
        <section className="purchase-card" aria-labelledby="purchase-list-title">
        <div className="purchase-section-heading">
          <div>
            <h2 id="purchase-list-title">Purchase List</h2>
            <p>Review and manage recorded purchases.</p>
          </div>
          <span className="purchase-count">0 purchases</span>
        </div>
        <div className="purchase-list-toolbar">
          <label className="purchase-search-wrap">
            <span className="purchase-search-icon" aria-hidden="true">⌕</span>
            <input type="search" placeholder="Search Purchase" aria-label="Search purchases" />
          </label>
          <button className="purchase-filter-button" type="button">All purchases <span aria-hidden="true">⌄</span></button>
        </div>
        <div className="purchase-table-wrap">
          <table className="purchase-table">
            <thead>
              <tr>
                <th scope="col">Purchase ID</th>
                <th scope="col">Purchase Type</th>
                <th scope="col">Supplier</th>
                <th scope="col">Item</th>
                <th scope="col">Purchase Date</th>
                <th scope="col">Edit</th>
                <th scope="col">Delete</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="7" className="purchase-empty-state">
                  <span className="purchase-empty-icon" aria-hidden="true">▤</span>
                  <strong>No purchases yet</strong>
                  <span>Your recorded purchases will appear here.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </section>
      ) : (

        <section className="purchase-card purchase-entry-card" aria-labelledby="purchase-entry-title">
        <div className="purchase-section-heading">
          <div>
            <h2 id="purchase-entry-title">Purchase Entry</h2>
            <p>Add purchase details and inventory items.</p>
          </div>
          <span className="purchase-draft-badge">New entry</span>
        </div>

        <div className="purchase-form-section">
          <h3>Purchase Information</h3>
          <div className="purchase-form-grid purchase-info-grid">
            <fieldset className="purchase-field purchase-choice-field">
              <legend>Purchase Type</legend>
              <label><input type="radio" name="purchase-type" /> New</label>
              <label><input type="radio" name="purchase-type" defaultChecked /> Used</label>
            </fieldset>
            <fieldset className="purchase-field purchase-choice-field">
              <legend>Party Type</legend>
              <label><input type="radio" name="party-type" defaultChecked /> Supplier</label>
              <label><input type="radio" name="party-type" /> Walking</label>
            </fieldset>
            <div className="purchase-field">
              <label htmlFor="purchase-supplier">Supplier <span aria-hidden="true">*</span></label>
              <select id="purchase-supplier" defaultValue="">
                <option value="" disabled>Select Supplier</option>
              </select>
            </div>
            <label className="purchase-credit-option">
              <input type="checkbox" />
              <span>Credit purchase</span>
            </label>
          </div>

          <div className="purchase-walking-fields">
            <div className="purchase-field">
              <label htmlFor="purchase-customer">Customer Name <span aria-hidden="true">*</span></label>
              <input id="purchase-customer" type="text" placeholder="Customer Name" />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-father">Father Name</label>
              <input id="purchase-father" type="text" placeholder="Father Name" />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-cnic">CNIC <span aria-hidden="true">*</span></label>
              <input id="purchase-cnic" type="text" placeholder="CNIC" />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-contact">Contact No</label>
              <input id="purchase-contact" type="tel" placeholder="Contact No" />
            </div>
            <button className="purchase-upload-button" type="button">
              <span aria-hidden="true">↑</span> Add Images
            </button>
          </div>

          <div className="purchase-form-grid purchase-meta-grid">
            <div className="purchase-field">
              <label htmlFor="purchase-date">Purchase Date</label>
              <input id="purchase-date" type="text" placeholder="DD-MMM-YYYY" />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-invoice">Invoice No</label>
              <input id="purchase-invoice" type="text" placeholder="Invoice No" />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-remarks">Remarks</label>
              <input id="purchase-remarks" type="text" placeholder="Remarks" />
            </div>
          </div>
        </div>

        <div className="purchase-form-section purchase-items-section">
          <div className="purchase-section-heading purchase-items-heading">
            <div>
              <h3>Purchase Items</h3>
              <p>Add item details to this purchase.</p>
            </div>
          </div>
          <div className="purchase-item-entry-grid">
            <div className="purchase-field purchase-item-search">
              <label htmlFor="purchase-item">Item</label>
              <input id="purchase-item" type="search" placeholder="Search Model, Company" />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-ramrom">RamRom</label>
              <select id="purchase-ramrom" defaultValue="">
                <option value="" disabled>Select RamRom</option>
              </select>
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-imei">IMEI <span aria-hidden="true">*</span></label>
              <input id="purchase-imei" type="text" placeholder="IMEI" />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-price">Purchase Price <span aria-hidden="true">*</span></label>
              <input id="purchase-price" type="text" inputMode="decimal" placeholder="0.00" />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-sale-price">Sale Price</label>
              <input id="purchase-sale-price" type="text" inputMode="decimal" placeholder="0.00" />
            </div>
            <button className="purchase-add-item-button" type="button">
              <span aria-hidden="true">＋</span> Add Item
            </button>
          </div>

          <div className="purchase-table-wrap purchase-detail-wrap">
            <table className="purchase-table purchase-detail-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Purchase Price</th>
                  <th scope="col">Sale Price</th>
                  <th scope="col">IMEI</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="6" className="purchase-detail-empty">Items added to this purchase will appear here.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="purchase-total-fields">
          <div className="purchase-total-row">
            <label htmlFor="purchase-cash">Cash Amount</label>
            <div className="purchase-amount-input"><span>$</span><input id="purchase-cash" type="text" inputMode="decimal" defaultValue="0.00" /></div>
          </div>
          <div className="purchase-total-row">
            <label htmlFor="purchase-online">Online Transfer Amount</label>
            <div className="purchase-amount-input"><span>$</span><input id="purchase-online" type="text" inputMode="decimal" defaultValue="0.00" /></div>
          </div>
        </div>

        <div className="purchase-form-actions">
          <button className="purchase-save-button" type="button">Save Purchase</button>
          <button className="purchase-cancel-button" type="button" onClick={() => setIsAddingPurchase(false)}>Cancel</button>
        </div>
        </section>
      )}
    </div>
  );
}

export default PurchasePage;
