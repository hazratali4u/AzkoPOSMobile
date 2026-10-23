import React, { useEffect, useState } from 'react';
import { useUser } from '../UserContext';

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
  const [error, setError] = useState('');

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
  }, [connString]);

  return (
    <div className="section-page shop-page" data-testid="shop-page">
      <h1>Setting / Shop</h1>
      <section className="shop-form-card" aria-label="Shop details">
        <form className="shop-form">
          {isLoading && <div role="status">Loading shop details...</div>}
          {error && <div role="alert">{error}</div>}
          <input id="shop-id" name="shopID" type="hidden" value={shop.shopID} readOnly />
          <div className="shop-form-field">
            <label htmlFor="shop-name">Shop Name <span aria-hidden="true">*</span></label>
            <input
              id="shop-name"
              name="shopName"
              type="text"
              placeholder="Shop Name"
              value={shop.name}
              onChange={(event) => setShop({ ...shop, name: event.target.value })}
            />
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
            <button className="shop-save-button" type="button">Update</button>
            <button className="shop-cancel-button" type="button">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ShopPage;
