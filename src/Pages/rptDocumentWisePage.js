import React, { useState } from 'react';
import '../css/rptDocumentWisePage.css';

const salesColumns = [
  'Customer Type',
  'Customer Name',
  'Contact',
  'Sale Date',
  'Item',
  'IMEI',
  'View',
];

const purchaseColumns = [
  'Purchase Type',
  'Party Type',
  'Party Name',
  'CNIC',
  'Contact No',
  'Purchase Date',
  'Item',
  'IMEI',
  'View',
];

function RptDocumentWisePage() {
  const [documentType, setDocumentType] = useState('sales');
  const columns = documentType === 'sales' ? salesColumns : purchaseColumns;
  const documentLabel = documentType === 'sales' ? 'sale' : 'purchase';

  return (
    <div className="section-page document-report-page" data-testid="document-wise-report-page">
      <h1>Reports / Document Wise Report</h1>

      <section className="document-report-card" aria-label="Document wise report">
        <div className="document-report-filters">
          <fieldset className="document-report-type">
            <legend>Document Type</legend>
            <label>
              <input
                type="radio"
                name="document-report-type"
                value="sales"
                checked={documentType === 'sales'}
                onChange={() => setDocumentType('sales')}
              />
              Sales
            </label>
            <label>
              <input
                type="radio"
                name="document-report-type"
                value="purchase"
                checked={documentType === 'purchase'}
                onChange={() => setDocumentType('purchase')}
              />
              Purchase
            </label>
          </fieldset>

          <div className="document-report-date-fields">
            <div className="document-report-field">
              <label htmlFor="document-report-from-date">From Date</label>
              <input id="document-report-from-date" type="date" />
            </div>
            <div className="document-report-field">
              <label htmlFor="document-report-to-date">To Date</label>
              <input id="document-report-to-date" type="date" />
            </div>
            <button className="document-report-get-button" type="button">Get Data</button>
          </div>
        </div>

        <div className="document-report-results">
          <label className="document-report-search page-search-wrap">
            <span className="page-search-icon" aria-hidden="true">⌕</span>
            <input
              className="page-search-input"
              type="search"
              placeholder="Search Customer Name, Contact, Item, IMEI"
              aria-label={`Search ${documentLabel} documents`}
            />
          </label>

          <div className="document-report-table-wrap">
            <table className="document-report-table">
              <thead>
                <tr>
                  {columns.map((column) => <th scope="col" key={column}>{column}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={columns.length} className="document-report-empty">
                    No {documentLabel} documents to display.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RptDocumentWisePage;
