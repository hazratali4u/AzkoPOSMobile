import React from 'react';

function ShopPage() {
  return (
    <div className="section-page shop-page" data-testid="shop-page">
      <h1>Setting / Shop</h1>
      <section className="shop-form-card" aria-label="Shop details">
        <form className="shop-form">
          <div className="shop-form-field">
            <label htmlFor="shop-name">Shop Name <span aria-hidden="true">*</span></label>
            <input id="shop-name" name="shopName" type="text" placeholder="Shop Name" />
          </div>
          <div className="shop-form-field">
            <label htmlFor="shop-address">Shop Address</label>
            <textarea id="shop-address" name="shopAddress" rows="4" />
          </div>
          <div className="shop-form-field">
            <label htmlFor="shop-contact-person">Shop Contact Person</label>
            <input id="shop-contact-person" name="contactPerson" type="text" placeholder="Shop Contact Person" />
          </div>
          <div className="shop-form-field">
            <label htmlFor="shop-contact-number">Contact Number</label>
            <input id="shop-contact-number" name="contactNumber" type="tel" placeholder="Contact Number" />
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
