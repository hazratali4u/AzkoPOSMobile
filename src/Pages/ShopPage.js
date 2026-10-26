import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext';
import '../css/ShopPage.css';

function ShopPage() {
  const user = useUser();
  const connString = user && user.connString;
  const [shop, setShop] = useState({
    shopID: '',
    name: '',
    address: '',
    conactPerson: '',
    conactNumber: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const [shopNameError, setShopNameError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadShop() {
      if (typeof connString !== 'string' || !connString.trim()) {
        setError('Unable to load shop details.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('https://api.azkopos.com/AzkoAPI/GetShopData', {
          method: 'GET',
          headers: {
            ConnectionString: connString,
          },
        });

        if (!response.ok) {
          throw new Error('Shop request failed.');
        }

        const data = await response.json();
        if (
          !data
          || !Number.isFinite(data.shopID)
          || typeof data.name !== 'string'
          || typeof data.address !== 'string'
          || typeof data.conactPerson !== 'string'
          || typeof data.conactNumber !== 'string'
        ) {
          throw new Error('Shop response is invalid.');
        }

        if (isActive) {
          setShop(data);
        }
      } catch {
        if (isActive) {
          setError('Unable to load shop details. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadShop();
    return () => {
      isActive = false;
    };
  }, [connString, reloadKey]);

  const handleCancel = () => {
    setError('');
    setShopNameError('');
    setSaveMessage('');
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setShopNameError('');
    setSaveMessage('');

    if (!shop.name.trim()) {
      setShopNameError('Shop Name is required.');
      return;
    }

    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || !Number.isFinite(shop.shopID)
    ) {
      setError('Unable to save shop details.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('https://api.azkopos.com/AzkoAPI/UpdateShop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          Name: shop.name,
          Address: shop.address,
          ConactPerson: shop.conactPerson,
          ConactNumber: shop.conactNumber,
          UserID: user.userID,
          ShopID: shop.shopID,
        }),
      });

      const responseText = await response.text();
      if (!response.ok || responseText.trim() !== 'Sucess') {
        throw new Error('Shop update request failed.');
      }

      setSaveMessage('Shop details saved successfully.');
    } catch {
      setError('Unable to save shop details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="section-page shop-page" data-testid="shop-page">
      <h1>Setting / Shop</h1>
      <section className="shop-form-card" aria-label="Shop details">
        <form className="shop-form" noValidate onSubmit={handleSave}>
          {isLoading && <div role="status">Loading shop details...</div>}
          {error && <div role="alert">{error}</div>}
          {saveMessage && <div role="status">{saveMessage}</div>}
          <input id="shop-id" name="shopID" type="hidden" value={shop.shopID} readOnly />
          <div className="shop-form-field">
            <label htmlFor="shop-name">Shop Name <span aria-hidden="true">*</span></label>
            <input
              id="shop-name"
              name="shopName"
              type="text"
              placeholder="Shop Name"
              required
              aria-invalid={Boolean(shopNameError)}
              aria-describedby={shopNameError ? 'shop-name-error' : undefined}
              value={shop.name}
              onChange={(event) => {
                const name = event.target.value;
                setShop({ ...shop, name });
                if (name.trim()) {
                  setShopNameError('');
                }
              }}
            />
            {shopNameError && (
              <span id="shop-name-error" className="required-field-error" role="alert">
                {shopNameError}
              </span>
            )}
          </div>
          <div className="shop-form-field">
            <label htmlFor="shop-address">Shop Address</label>
            <textarea
              id="shop-address"
              name="shopAddress"
              rows="4"
              value={shop.address}
              onChange={(event) => setShop({ ...shop, address: event.target.value })}
            />
          </div>
          <div className="shop-form-field">
            <label htmlFor="shop-contact-person">Shop Contact Person</label>
            <input
              id="shop-contact-person"
              name="contactPerson"
              type="text"
              placeholder="Shop Contact Person"
              value={shop.conactPerson}
              onChange={(event) => setShop({ ...shop, conactPerson: event.target.value })}
            />
          </div>
          <div className="shop-form-field">
            <label htmlFor="shop-contact-number">Contact Number</label>
            <input
              id="shop-contact-number"
              name="contactNumber"
              type="tel"
              placeholder="Contact Number"
              value={shop.conactNumber}
              onChange={(event) => setShop({ ...shop, conactNumber: event.target.value })}
            />
          </div>
          <div className="shop-form-actions">
            <button className="shop-save-button" type="submit" disabled={isSaving || isLoading}>
              {isSaving ? 'Saving...' : 'Update'}
            </button>
            <button
              className="shop-cancel-button"
              type="button"
              onClick={handleCancel}
              disabled={isLoading || isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ShopPage;
