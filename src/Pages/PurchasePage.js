import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '../UserContext';
import '../css/PurchasePage.css';

function formatPurchaseDate(value) {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-').map(Number);
  const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1];
  return monthName ? `${String(day).padStart(2, '0')}-${monthName}-${year}` : '';
}

function PurchasePage() {
  const user = useUser();
  const connString = user && user.connString;
  const purchaseDatePickerRef = useRef(null);
  const modelInputRef = useRef(null);
  const ramRomInputRef = useRef(null);
  const imeiInputRef = useRef(null);
  const purchasePriceInputRef = useRef(null);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [itemImei, setItemImei] = useState('');
  const [itemPurchasePrice, setItemPurchasePrice] = useState('');
  const [itemSalePrice, setItemSalePrice] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [editingPurchaseItemIndex, setEditingPurchaseItemIndex] = useState(null);
  const [itemEntryError, setItemEntryError] = useState('');
  const [isCreditPurchase, setIsCreditPurchase] = useState(false);
  const [cashAmount, setCashAmount] = useState('0.00');
  const [onlineAmount, setOnlineAmount] = useState('0.00');
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [supplierLoadError, setSupplierLoadError] = useState('');
  const [reloadSuppliersKey, setReloadSuppliersKey] = useState(0);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const [activeSupplierIndex, setActiveSupplierIndex] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState('');
  const [reloadModelsKey, setReloadModelsKey] = useState(0);
  const [modelSearch, setModelSearch] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [model, setModel] = useState('');
  const [ramRoms, setRamRoms] = useState([]);
  const [isLoadingRamRoms, setIsLoadingRamRoms] = useState(false);
  const [ramRomLoadError, setRamRomLoadError] = useState('');
  const [reloadRamRomsKey, setReloadRamRomsKey] = useState(0);
  const [ramRom, setRamRom] = useState('');
  const [ramRomSearch, setRamRomSearch] = useState('');
  const [isRamRomDropdownOpen, setIsRamRomDropdownOpen] = useState(false);
  const [activeRamRomIndex, setActiveRamRomIndex] = useState(0);

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

  useEffect(() => {
    if (!isAddingPurchase) {
      return undefined;
    }

    let isActive = true;

    async function loadModels() {
      setModels([]);
      setModelLoadError('');

      if (typeof connString !== 'string' || !connString.trim()) {
        setIsLoadingModels(false);
        setModelLoadError('Unable to load models.');
        return;
      }

      setIsLoadingModels(true);
      try {
        const response = await fetch('https://api.azkopos.com/Model/GetModelData?TypeID=2&CompanyID=0', {
          method: 'GET',
          headers: {
            ConnectionString: connString,
          },
        });

        if (!response.ok) {
          throw new Error('Model request failed.');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.some((item) => (
          !item
          || !Number.isFinite(item.modelID)
          || typeof item.name !== 'string'
          || (item.companyName !== undefined && typeof item.companyName !== 'string')
        ))) {
          throw new Error('Model response is invalid.');
        }

        if (isActive) {
          setModels(data);
        }
      } catch {
        if (isActive) {
          setModelLoadError('Unable to load models. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoadingModels(false);
        }
      }
    }

    loadModels();
    return () => {
      isActive = false;
    };
  }, [connString, isAddingPurchase, reloadModelsKey]);

  useEffect(() => {
    if (!isAddingPurchase) {
      return undefined;
    }

    let isActive = true;

    async function loadRamRoms() {
      setRamRoms([]);
      setRamRomLoadError('');

      if (typeof connString !== 'string' || !connString.trim()) {
        setIsLoadingRamRoms(false);
        setRamRomLoadError('Unable to load RamRom entries.');
        return;
      }

      setIsLoadingRamRoms(true);
      try {
        const response = await fetch('https://api.azkopos.com/RamRom/GetRamRomData?TypeID=2', {
          method: 'GET',
          headers: {
            ConnectionString: connString,
          },
        });

        if (!response.ok) {
          throw new Error('RamRom request failed.');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.some((item) => (
          !item
          || !Number.isFinite(item.ramRomID)
          || typeof item.name !== 'string'
        ))) {
          throw new Error('RamRom response is invalid.');
        }

        if (isActive) {
          setRamRoms(data);
        }
      } catch {
        if (isActive) {
          setRamRomLoadError('Unable to load RamRom entries. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoadingRamRoms(false);
        }
      }
    }

    loadRamRoms();
    return () => {
      isActive = false;
    };
  }, [connString, isAddingPurchase, reloadRamRomsKey]);

  const filteredSuppliers = useMemo(() => {
    const query = supplierSearch.trim().toLowerCase();
    return suppliers.filter((supplierOption) => supplierOption.name.toLowerCase().includes(query));
  }, [suppliers, supplierSearch]);

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    return models.filter((modelOption) => (
      modelOption.name.toLowerCase().includes(query)
      || (modelOption.companyName || '').toLowerCase().includes(query)
    ));
  }, [models, modelSearch]);

  const filteredRamRoms = useMemo(() => {
    const query = ramRomSearch.trim().toLowerCase();
    return ramRoms.filter((ramRomOption) => ramRomOption.name.toLowerCase().includes(query));
  }, [ramRoms, ramRomSearch]);

  const selectedSupplierName = suppliers.find(
    (supplierOption) => String(supplierOption.partyID) === supplier,
  )?.name || '';
  const selectedModelName = models.find(
    (modelOption) => String(modelOption.modelID) === model,
  )?.name || '';
  const selectedRamRomName = ramRoms.find(
    (ramRomOption) => String(ramRomOption.ramRomID) === ramRom,
  )?.name || '';

  const clearItemEntry = () => {
    setModel('');
    setModelSearch('');
    setIsModelDropdownOpen(false);
    setRamRom('');
    setRamRomSearch('');
    setIsRamRomDropdownOpen(false);
    setItemImei('');
    setItemPurchasePrice('');
    setItemSalePrice('');
    setEditingPurchaseItemIndex(null);
  };

  const updateCashAmount = (items, isCredit = isCreditPurchase) => {
    const total = items.reduce((sum, item) => sum + item.purchasePrice, 0);
    const parsedOnlineAmount = Number(onlineAmount);
    setCashAmount(isCredit
      ? '0.00'
      : (total - (Number.isFinite(parsedOnlineAmount) ? parsedOnlineAmount : 0)).toFixed(2));
  };

  const updateOnlineAmountFromCash = (value) => {
    setCashAmount(value);
    const parsedCashAmount = Number(value);
    if (Number.isFinite(parsedCashAmount)) {
      const total = purchaseItems.reduce((sum, item) => sum + item.purchasePrice, 0);
      setOnlineAmount((total - parsedCashAmount).toFixed(2));
    }
  };

  const updateCashAmountFromOnline = (value) => {
    setOnlineAmount(value);
    const parsedOnlineAmount = Number(value);
    if (Number.isFinite(parsedOnlineAmount)) {
      const total = purchaseItems.reduce((sum, item) => sum + item.purchasePrice, 0);
      setCashAmount(isCreditPurchase ? '0.00' : (total - parsedOnlineAmount).toFixed(2));
    }
  };

  const addPurchaseItem = () => {
    setItemEntryError('');

    if (!model) {
      setItemEntryError('Item is required.');
      modelInputRef.current?.focus();
      return;
    }

    if (!ramRom) {
      setItemEntryError('RamRom is required.');
      ramRomInputRef.current?.focus();
      return;
    }

    if (!itemImei.trim()) {
      setItemEntryError('IMEI is required.');
      imeiInputRef.current?.focus();
      return;
    }

    if (!itemPurchasePrice.trim()) {
      setItemEntryError('Purchase Price is required.');
      purchasePriceInputRef.current?.focus();
      return;
    }

    const parsedPurchasePrice = Number(itemPurchasePrice);
    if (!Number.isFinite(parsedPurchasePrice)) {
      setItemEntryError('Enter a valid Purchase Price.');
      purchasePriceInputRef.current?.focus();
      return;
    }

    const parsedSalePrice = itemSalePrice.trim() ? Number(itemSalePrice) : 0;
    if (!Number.isFinite(parsedSalePrice)) {
      setItemEntryError('Enter a valid Sale Price.');
      return;
    }

    const isDuplicate = purchaseItems.some((item, index) => (
      index !== editingPurchaseItemIndex
      && item.modelID === model
      && item.ramRomID === ramRom
    ));
    if (isDuplicate) {
      setItemEntryError('This Item and RamRom already exist.');
      return;
    }

    const selectedModel = models.find((item) => String(item.modelID) === model);
    const selectedRamRom = ramRoms.find((item) => String(item.ramRomID) === ramRom);
    const nextItem = {
      modelID: model,
      modelName: selectedModel ? selectedModel.name : selectedModelName,
      ramRomID: ramRom,
      ramRomName: selectedRamRom ? selectedRamRom.name : selectedRamRomName,
      purchasePrice: parsedPurchasePrice,
      salePrice: parsedSalePrice,
      imei: itemImei.trim(),
    };
    const nextItems = editingPurchaseItemIndex === null
      ? [...purchaseItems, nextItem]
      : purchaseItems.map((item, index) => (
        index === editingPurchaseItemIndex ? nextItem : item
      ));

    setPurchaseItems(nextItems);
    updateCashAmount(nextItems);
    clearItemEntry();
  };

  const editPurchaseItem = (index) => {
    const item = purchaseItems[index];
    setModel(item.modelID);
    setRamRom(item.ramRomID);
    setItemImei(item.imei);
    setItemPurchasePrice(String(item.purchasePrice));
    setItemSalePrice(item.salePrice ? String(item.salePrice) : '');
    setEditingPurchaseItemIndex(index);
    setItemEntryError('');
  };

  const deletePurchaseItem = (index) => {
    const nextItems = purchaseItems.filter((_, itemIndex) => itemIndex !== index);
    setPurchaseItems(nextItems);
    updateCashAmount(nextItems);
    if (editingPurchaseItemIndex === index) {
      clearItemEntry();
    } else if (editingPurchaseItemIndex !== null && editingPurchaseItemIndex > index) {
      setEditingPurchaseItemIndex(editingPurchaseItemIndex - 1);
    }
    setItemEntryError('');
  };

  return (
    <div className={`section-page purchase-page${isAddingPurchase ? ' is-adding-purchase' : ''}`} data-testid="purchase-page">
      <h1>Transactions / Purchase</h1>

      {!isAddingPurchase ? (
        <section className="purchase-card" aria-labelledby="purchase-list-title">        
        <div className="purchase-list-toolbar">
          <label className="purchase-search-wrap">
            <span className="purchase-search-icon" aria-hidden="true">⌕</span>
            <input type="search" placeholder="Search Purchase" aria-label="Search purchases" />
          </label>
          <button className="purchase-primary-button" type="button" onClick={() => setIsAddingPurchase(true)}>
            <span aria-hidden="true">＋</span> Add Purchase
          </button>
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
        <div className="purchase-form-section">
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
              <input
                type="checkbox"
                checked={isCreditPurchase}
                onChange={(event) => {
                  const isCredit = event.target.checked;
                  setIsCreditPurchase(isCredit);
                  updateCashAmount(purchaseItems, isCredit);
                }}
              />
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
          </div>

          <div className="purchase-form-grid purchase-meta-grid">
            <div className="purchase-field">
              <label htmlFor="purchase-date">Purchase Date</label>
              <div className="purchase-date-picker">
                <input
                  id="purchase-date"
                  type="text"
                  value={formatPurchaseDate(purchaseDate)}
                  placeholder="DD-MMM-YYYY"
                  readOnly
                />
                <button
                  className="purchase-date-picker-button"
                  type="button"
                  aria-label="Open purchase date calendar"
                  onClick={() => {
                    const datePicker = purchaseDatePickerRef.current;
                    if (datePicker && typeof datePicker.showPicker === 'function') {
                      datePicker.showPicker();
                    } else if (datePicker) {
                      datePicker.click();
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 17H5V9h14v10ZM7 11h3v3H7v-3Z" />
                  </svg>
                </button>
                <input
                  ref={purchaseDatePickerRef}
                  className="purchase-date-native-input"
                  type="date"
                  value={purchaseDate}
                  onChange={(event) => setPurchaseDate(event.target.value)}
                  tabIndex="-1"
                  aria-hidden="true"
                />
              </div>
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
              <div className="purchase-model-combobox">
                <input
                  ref={modelInputRef}
                  id="purchase-item"
                  type="text"
                  role="combobox"
                  autoComplete="off"
                  placeholder={isLoadingModels ? 'Loading models...' : 'Search Model, Company'}
                  value={isModelDropdownOpen ? modelSearch : selectedModelName}
                  aria-autocomplete="list"
                  aria-controls="purchase-model-options"
                  aria-expanded={isModelDropdownOpen}
                  aria-activedescendant={
                    isModelDropdownOpen && filteredModels[activeModelIndex]
                      ? `purchase-model-option-${filteredModels[activeModelIndex].modelID}`
                      : undefined
                  }
                  onFocus={() => {
                    setModelSearch('');
                    setActiveModelIndex(0);
                    setIsModelDropdownOpen(true);
                  }}
                  onBlur={() => setIsModelDropdownOpen(false)}
                  onChange={(event) => {
                    setModel('');
                    setModelSearch(event.target.value);
                    setActiveModelIndex(0);
                    setIsModelDropdownOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setIsModelDropdownOpen(true);
                      setActiveModelIndex((index) => (
                        filteredModels.length ? Math.min(index + 1, filteredModels.length - 1) : 0
                      ));
                    } else if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      setIsModelDropdownOpen(true);
                      setActiveModelIndex((index) => Math.max(index - 1, 0));
                    } else if (event.key === 'Enter' && isModelDropdownOpen && filteredModels[activeModelIndex]) {
                      event.preventDefault();
                      const selectedModel = filteredModels[activeModelIndex];
                      setModel(String(selectedModel.modelID));
                      setModelSearch('');
                      setIsModelDropdownOpen(false);
                    } else if (event.key === 'Escape') {
                      setIsModelDropdownOpen(false);
                      setModelSearch('');
                    }
                  }}
                  disabled={isLoadingModels}
                />
                {isModelDropdownOpen && (
                  <div
                    id="purchase-model-options"
                    className="purchase-model-options"
                    role="listbox"
                    aria-label="Models"
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    {filteredModels.length > 0 ? filteredModels.map((modelOption, index) => (
                      <div
                        id={`purchase-model-option-${modelOption.modelID}`}
                        key={modelOption.modelID}
                        className={`purchase-model-option${index === activeModelIndex ? ' is-active' : ''}`}
                        role="option"
                        aria-selected={String(modelOption.modelID) === model}
                        onMouseEnter={() => setActiveModelIndex(index)}
                        onClick={() => {
                          setModel(String(modelOption.modelID));
                          setModelSearch('');
                          setIsModelDropdownOpen(false);
                        }}
                      >
                        {modelOption.name}{modelOption.companyName ? ` — ${modelOption.companyName}` : ''}
                      </div>
                    )) : (
                      <div className="purchase-model-no-options" role="status">
                        {isLoadingModels ? 'Loading models...' : 'No models found.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {modelLoadError && (
                <span role="alert">
                  {modelLoadError}{' '}
                  <button type="button" onClick={() => setReloadModelsKey((key) => key + 1)}>
                    Retry
                  </button>
                </span>
              )}
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-ramrom">RamRom</label>
              <div className="purchase-ramrom-combobox">
                <input
                  ref={ramRomInputRef}
                  id="purchase-ramrom"
                  type="text"
                  role="combobox"
                  autoComplete="off"
                  placeholder={isLoadingRamRoms ? 'Loading RamRom...' : 'Search RamRom'}
                  value={isRamRomDropdownOpen ? ramRomSearch : selectedRamRomName}
                  aria-autocomplete="list"
                  aria-controls="purchase-ramrom-options"
                  aria-expanded={isRamRomDropdownOpen}
                  aria-activedescendant={
                    isRamRomDropdownOpen && filteredRamRoms[activeRamRomIndex]
                      ? `purchase-ramrom-option-${filteredRamRoms[activeRamRomIndex].ramRomID}`
                      : undefined
                  }
                  onFocus={() => {
                    setRamRomSearch('');
                    setActiveRamRomIndex(0);
                    setIsRamRomDropdownOpen(true);
                  }}
                  onBlur={() => setIsRamRomDropdownOpen(false)}
                  onChange={(event) => {
                    setRamRom('');
                    setRamRomSearch(event.target.value);
                    setActiveRamRomIndex(0);
                    setIsRamRomDropdownOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setIsRamRomDropdownOpen(true);
                      setActiveRamRomIndex((index) => (
                        filteredRamRoms.length ? Math.min(index + 1, filteredRamRoms.length - 1) : 0
                      ));
                    } else if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      setIsRamRomDropdownOpen(true);
                      setActiveRamRomIndex((index) => Math.max(index - 1, 0));
                    } else if (
                      event.key === 'Enter'
                      && isRamRomDropdownOpen
                      && filteredRamRoms[activeRamRomIndex]
                    ) {
                      event.preventDefault();
                      const selectedRamRom = filteredRamRoms[activeRamRomIndex];
                      setRamRom(String(selectedRamRom.ramRomID));
                      setRamRomSearch('');
                      setIsRamRomDropdownOpen(false);
                    } else if (event.key === 'Escape') {
                      setIsRamRomDropdownOpen(false);
                      setRamRomSearch('');
                    }
                  }}
                  disabled={isLoadingRamRoms}
                />
                {isRamRomDropdownOpen && (
                  <div
                    id="purchase-ramrom-options"
                    className="purchase-ramrom-options"
                    role="listbox"
                    aria-label="RamRom options"
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    {filteredRamRoms.length > 0 ? filteredRamRoms.map((ramRomOption, index) => (
                      <div
                        id={`purchase-ramrom-option-${ramRomOption.ramRomID}`}
                        key={ramRomOption.ramRomID}
                        className={`purchase-ramrom-option${index === activeRamRomIndex ? ' is-active' : ''}`}
                        role="option"
                        aria-selected={String(ramRomOption.ramRomID) === ramRom}
                        onMouseEnter={() => setActiveRamRomIndex(index)}
                        onClick={() => {
                          setRamRom(String(ramRomOption.ramRomID));
                          setRamRomSearch('');
                          setIsRamRomDropdownOpen(false);
                        }}
                      >
                        {ramRomOption.name}
                      </div>
                    )) : (
                      <div className="purchase-ramrom-no-options" role="status">
                        {isLoadingRamRoms ? 'Loading RamRom...' : 'No RamRom options found.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {ramRomLoadError && (
                <span role="alert">
                  {ramRomLoadError}{' '}
                  <button type="button" onClick={() => setReloadRamRomsKey((key) => key + 1)}>
                    Retry
                  </button>
                </span>
              )}
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-imei">IMEI <span aria-hidden="true">*</span></label>
              <input
                ref={imeiInputRef}
                id="purchase-imei"
                type="text"
                placeholder="IMEI"
                value={itemImei}
                onChange={(event) => setItemImei(event.target.value)}
              />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-price">Purchase Price <span aria-hidden="true">*</span></label>
              <input
                ref={purchasePriceInputRef}
                id="purchase-price"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={itemPurchasePrice}
                onChange={(event) => setItemPurchasePrice(event.target.value)}
              />
            </div>
            <div className="purchase-field">
              <label htmlFor="purchase-sale-price">Sale Price</label>
              <input
                id="purchase-sale-price"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={itemSalePrice}
                onChange={(event) => setItemSalePrice(event.target.value)}
              />
            </div>
            <button className="purchase-add-item-button" type="button" onClick={addPurchaseItem}>
              <span aria-hidden="true">{editingPurchaseItemIndex === null ? '＋' : '✓'}</span>
              {editingPurchaseItemIndex === null ? 'Add Item' : 'Update Item'}
            </button>
          </div>
          {itemEntryError && <p className="purchase-item-error" role="alert">{itemEntryError}</p>}

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
                {purchaseItems.length > 0 ? purchaseItems.map((item, index) => (
                  <tr key={`${item.modelID}-${item.ramRomID}-${item.imei}-${index}`}>
                    <td data-label="Item">
                      {item.modelName}{item.ramRomName ? ` (${item.ramRomName})` : ''}
                    </td>
                    <td data-label="Purchase Price">{item.purchasePrice.toFixed(2)}</td>
                    <td data-label="Sale Price">{item.salePrice.toFixed(2)}</td>
                    <td data-label="IMEI">{item.imei}</td>
                    <td data-label="Edit">
                      <button
                        className="purchase-detail-icon-button purchase-detail-edit-button"
                        type="button"
                        aria-label={`Edit ${item.modelName}`}
                        onClick={() => editPurchaseItem(index)}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </td>
                    <td data-label="Delete">
                      <button
                        className="purchase-detail-icon-button purchase-detail-delete-button"
                        type="button"
                        aria-label={`Delete ${item.modelName}`}
                        onClick={() => deletePurchaseItem(index)}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="purchase-detail-empty">Items added to this purchase will appear here.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="purchase-total-fields">
          <div className="purchase-total-row">
            <label htmlFor="purchase-cash">Cash Amount</label>
            <div className="purchase-amount-input"><span>PKR</span><input id="purchase-cash" type="text" inputMode="decimal" value={cashAmount} onChange={(event) => updateOnlineAmountFromCash(event.target.value)} /></div>
          </div>
          <div className="purchase-total-row">
            <label htmlFor="purchase-online">Online Transfer Amount</label>
            <div className="purchase-amount-input"><span>PKR</span><input id="purchase-online" type="text" inputMode="decimal" value={onlineAmount} onChange={(event) => updateCashAmountFromOnline(event.target.value)} /></div>
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
