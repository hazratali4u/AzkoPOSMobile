import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../UserContext';
import '../css/PurchasePage.css';

function PurchasePage() {
  const user = useUser();
  const connString = user && user.connString;
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [supplierLoadError, setSupplierLoadError] = useState('');
  const [reloadSuppliersKey, setReloadSuppliersKey] = useState(0);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const [activeSupplierIndex, setActiveSupplierIndex] = useState(0);
  const [supplier, setSupplier] = useState('');

  useEffect(() => {
    if (!isAddingPurchase) {
      return undefined;
    }

    let isActive = true;

    async function loadSuppliers() {
      setSuppliers([]);
      setSupplierLoadError('');

      if (typeof connString !== 'string' || !connString.trim()) {
        setIsLoadingSuppliers(false);
        setSupplierLoadError('Unable to load suppliers.');
        return;
      }

      setIsLoadingSuppliers(true);
      try {
        const response = await fetch('https://api.azkopos.com/Party/GetPartyData?TypeID=1', {
          method: 'GET',
          headers: {
            ConnectionString: connString,
          },
        });

        if (!response.ok) {
          throw new Error('Supplier request failed.');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.some((item) => (
          !item
          || !Number.isFinite(item.partyID)
          || typeof item.name !== 'string'
        ))) {
          throw new Error('Supplier response is invalid.');
        }

        if (isActive) {
          setSuppliers(data);
        }
      } catch {
        if (isActive) {
          setSupplierLoadError('Unable to load suppliers. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoadingSuppliers(false);
        }
      }
    }

    loadSuppliers();
    return () => {
      isActive = false;
    };
  }, [connString, isAddingPurchase, reloadSuppliersKey]);

  const filteredSuppliers = useMemo(() => {
    const query = supplierSearch.trim().toLowerCase();
    return suppliers.filter((supplierOption) => supplierOption.name.toLowerCase().includes(query));
  }, [suppliers, supplierSearch]);

  const selectedSupplierName = suppliers.find(
    (supplierOption) => String(supplierOption.partyID) === supplier,
  )?.name || '';

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
              <div className="purchase-supplier-combobox">
                <input
                  id="purchase-supplier"
                  type="text"
                  role="combobox"
                  autoComplete="off"
                  placeholder={isLoadingSuppliers ? 'Loading suppliers...' : 'Select Supplier'}
                  value={isSupplierDropdownOpen ? supplierSearch : selectedSupplierName}
                  aria-autocomplete="list"
                  aria-controls="purchase-supplier-options"
                  aria-expanded={isSupplierDropdownOpen}
                  aria-activedescendant={
                    isSupplierDropdownOpen && filteredSuppliers[activeSupplierIndex]
                      ? `purchase-supplier-option-${filteredSuppliers[activeSupplierIndex].partyID}`
                      : undefined
                  }
                  onFocus={() => {
                    setSupplierSearch('');
                    setActiveSupplierIndex(0);
                    setIsSupplierDropdownOpen(true);
                  }}
                  onBlur={() => setIsSupplierDropdownOpen(false)}
                  onChange={(event) => {
                    setSupplier('');
                    setSupplierSearch(event.target.value);
                    setActiveSupplierIndex(0);
                    setIsSupplierDropdownOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setIsSupplierDropdownOpen(true);
                      setActiveSupplierIndex((index) => (
                        filteredSuppliers.length ? Math.min(index + 1, filteredSuppliers.length - 1) : 0
                      ));
                    } else if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      setIsSupplierDropdownOpen(true);
                      setActiveSupplierIndex((index) => Math.max(index - 1, 0));
                    } else if (event.key === 'Enter' && isSupplierDropdownOpen && filteredSuppliers[activeSupplierIndex]) {
                      event.preventDefault();
                      const selectedSupplierOption = filteredSuppliers[activeSupplierIndex];
                      setSupplier(String(selectedSupplierOption.partyID));
                      setSupplierSearch('');
                      setIsSupplierDropdownOpen(false);
                    } else if (event.key === 'Escape') {
                      setIsSupplierDropdownOpen(false);
                      setSupplierSearch('');
                    }
                  }}
                  disabled={isLoadingSuppliers}
                />
                {isSupplierDropdownOpen && (
                  <div
                    id="purchase-supplier-options"
                    className="purchase-supplier-options"
                    role="listbox"
                    aria-label="Suppliers"
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    {filteredSuppliers.length > 0 ? filteredSuppliers.map((supplierOption, index) => (
                      <div
                        id={`purchase-supplier-option-${supplierOption.partyID}`}
                        key={supplierOption.partyID}
                        className={`purchase-supplier-option${index === activeSupplierIndex ? ' is-active' : ''}`}
                        role="option"
                        aria-selected={String(supplierOption.partyID) === supplier}
                        onMouseEnter={() => setActiveSupplierIndex(index)}
                        onClick={() => {
                          setSupplier(String(supplierOption.partyID));
                          setSupplierSearch('');
                          setIsSupplierDropdownOpen(false);
                        }}
                      >
                        {supplierOption.name}
                      </div>
                    )) : (
                      <div className="purchase-supplier-no-options" role="status">
                        {isLoadingSuppliers ? 'Loading suppliers...' : 'No suppliers found.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {supplierLoadError && (
                <span role="alert">
                  {supplierLoadError}{' '}
                  <button type="button" onClick={() => setReloadSuppliersKey((key) => key + 1)}>
                    Retry
                  </button>
                </span>
              )}
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
