import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../UserContext';
import '../css/ModelPage.css';

function ModelPage() {
  const user = useUser();
  const connString = user && user.connString;
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(Boolean(connString));
  const [modelLoadError, setModelLoadError] = useState('');
  const [reloadModelsKey, setReloadModelsKey] = useState(0);
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(Boolean(connString));
  const [companyLoadError, setCompanyLoadError] = useState('');
  const [reloadCompaniesKey, setReloadCompaniesKey] = useState(0);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState({ company: '', name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadModels() {
      setModels([]);
      if (typeof connString !== 'string' || !connString.trim()) {
        setModelLoadError('Unable to load models.');
        setIsLoadingModels(false);
        return;
      }

      setIsLoadingModels(true);
      setModelLoadError('');

      try {
        const response = await fetch('https://api.azkopos.com/Model/GetAllModelData?TypeID=1&CompanyID=0', {
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
          || !Number.isFinite(item.companyID)
          || typeof item.name !== 'string'
          || typeof item.companyName !== 'string'
          || typeof item.status !== 'string'
        ))) {
          throw new Error('Model response is invalid.');
        }

        if (isActive) {
          setModels(data.map((item) => ({
            modelID: item.modelID,
            companyID: item.companyID,
            name: item.name,
            company: item.companyName,
            companyName: item.companyName,
            active: item.status.toLowerCase() === 'active',
          })));
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
  }, [connString, reloadModelsKey]);

  useEffect(() => {
    let isActive = true;

    async function loadCompanies() {
      setCompanies([]);
      if (typeof connString !== 'string' || !connString.trim()) {
        setCompanyLoadError('Unable to load companies.');
        setIsLoadingCompanies(false);
        return;
      }

      setIsLoadingCompanies(true);
      setCompanyLoadError('');

      try {
        const response = await fetch('https://api.azkopos.com/Company/GetCompanyData?TypeID=2', {
          method: 'GET',
          headers: {
            ConnectionString: connString,
          },
        });

        if (!response.ok) {
          throw new Error('Company request failed.');
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.some((item) => (
          !item
          || !Number.isFinite(item.companyID)
          || typeof item.name !== 'string'
        ))) {
          throw new Error('Company response is invalid.');
        }

        if (isActive) {
          setCompanies(data);
        }
      } catch {
        if (isActive) {
          setCompanyLoadError('Unable to load companies. Please try again.');
        }
      } finally {
        if (isActive) {
          setIsLoadingCompanies(false);
        }
      }
    }

    loadCompanies();
    return () => {
      isActive = false;
    };
  }, [connString, reloadCompaniesKey]);

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();
    return models
      .map((model, index) => ({ ...model, index }))
      .filter((model) => model.name.toLowerCase().includes(query));
  }, [models, search]);

  const openAddForm = () => {
    setName('');
    setCompany('');
    setEditingIndex(null);
    setErrors({ company: '', name: '' });
    setSaveError('');
    setSaveMessage('');
    setIsEditing(true);
  };

  const openEditForm = (index) => {
    setName(models[index].name);
    setCompany(String(models[index].companyID));
    setEditingIndex(index);
    setErrors({ company: '', name: '' });
    setSaveError('');
    setSaveMessage('');
    setIsEditing(true);
  };

  const saveModel = async (event) => {
    event.preventDefault();
    setSaveError('');
    setSaveMessage('');
    const nextErrors = {
      company: company.trim() ? '' : 'Company is required.',
      name: name.trim() ? '' : 'Model Name is required.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    const companyID = Number(company);
    const modelID = editingIndex === null ? 0 : models[editingIndex].modelID;
    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || !Number.isFinite(companyID)
      || !Number.isFinite(modelID)
    ) {
      setSaveError('Unable to save model.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('https://api.azkopos.com/Model/InsertUpdateModel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          ModelID: modelID,
          CompanyID: companyID,
          Name: name.trim(),
          UserID: user.userID,
          TypeID: editingIndex === null ? 1 : 2,
        }),
      });

      if (!response.ok) {
        throw new Error('Model save request failed.');
      }

      setSaveMessage('Model saved successfully.');
      setIsEditing(false);
      setReloadModelsKey((key) => key + 1);
    } catch {
      setSaveError('Unable to save model. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModel = async (index) => {
    const selectedModel = models[index];
    if (
      typeof connString !== 'string'
      || !connString.trim()
      || !Number.isFinite(user && user.userID)
      || !Number.isFinite(selectedModel && selectedModel.modelID)
      || !Number.isFinite(selectedModel && selectedModel.companyID)
    ) {
      setSaveError('Unable to update model status.');
      setSaveMessage('');
      return;
    }

    setSaveError('');
    setSaveMessage('');
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('https://api.azkopos.com/Model/InsertUpdateModel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: connString,
        },
        body: JSON.stringify({
          ModelID: selectedModel.modelID,
          CompanyID: selectedModel.companyID,
          Name: selectedModel.name,
          UserID: user.userID,
          TypeID: selectedModel.active ? 3 : 4,
        }),
      });

      if (!response.ok) {
        throw new Error('Model status request failed.');
      }

      setModels((currentModels) => currentModels.map((model) => (
        model.modelID === selectedModel.modelID
          ? { ...model, active: !selectedModel.active }
          : model
      )));
      setSaveMessage('Model status updated successfully.');
    } catch {
      setSaveError('Unable to update model status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="section-page model-page" data-testid="model-page">
      <h1>Item Management / Model</h1>
      {!isEditing ? (
        <section className="model-card" aria-label="Model list">
          <div className="model-toolbar">
            <input
              className="model-search"
              type="search"
              placeholder="Search Model"
              aria-label="Search Model"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="model-add-button" type="button" onClick={openAddForm}>
              Add Model
            </button>
          </div>
          {modelLoadError && (
            <div role="alert">
              {modelLoadError}{' '}
              {typeof connString === 'string' && connString.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setIsLoadingModels(true);
                    setReloadModelsKey((key) => key + 1);
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          )}
          {saveError && <div role="alert">{saveError}</div>}
          {saveMessage && <div role="status">{saveMessage}</div>}
          <div className="model-table-wrap">
            <table className="model-table">
              <thead>
                <tr>
                  <th scope="col">Model Name</th>
                  <th scope="col">Company Name</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Active/Inactive</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingModels ? (
                  <tr>
                    <td colSpan="4" className="model-empty-state" role="status">
                      Loading models...
                    </td>
                  </tr>
                ) : filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="model-empty-state">
                      {models.length === 0 ? 'No models available.' : 'No models match your search.'}
                    </td>
                  </tr>
                ) : filteredModels.map((model) => (
                  <tr key={model.index} className={!model.active ? 'is-inactive' : ''}>
                    <td data-label="Model Name">{model.name}</td>
                    <td data-label="Company Name">{model.companyName || model.company}</td>
                    <td data-label="Edit">
                      <button
                        className="model-icon-button model-edit-button"
                        type="button"
                        aria-label={`Edit ${model.name}`}
                        onClick={() => openEditForm(model.index)}
                      >
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                    </td>
                    <td data-label="Active/Inactive">
                      <button
                        className={`model-icon-button model-toggle-button${model.active ? '' : ' is-inactive'}`}
                        type="button"
                        aria-label={`${model.active ? 'Deactivate' : 'Activate'} ${model.name}`}
                        onClick={() => toggleModel(model.index)}
                        disabled={isUpdatingStatus}
                      >
                        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="model-card" aria-label={editingIndex === null ? 'Add Model' : 'Edit Model'}>
          <form className="model-form" onSubmit={saveModel} noValidate>
            {saveError && <div role="alert">{saveError}</div>}
            <div className="model-form-field">
              <label htmlFor="model-company">Company <span aria-hidden="true">*</span></label>
              <select
                id="model-company"
                value={company}
                aria-invalid={Boolean(errors.company)}
                aria-describedby={errors.company ? 'model-company-error' : undefined}
                onChange={(event) => {
                  const selectedCompany = event.target.value;
                  setCompany(selectedCompany);
                  if (selectedCompany.trim()) setErrors((current) => ({ ...current, company: '' }));
                }}
                disabled={isLoadingCompanies}
              >
                <option value="">
                  {isLoadingCompanies ? 'Loading companies...' : 'Select Company'}
                </option>
                {companies.map((companyOption) => (
                  <option key={companyOption.companyID} value={String(companyOption.companyID)}>
                    {companyOption.name}
                  </option>
                ))}
              </select>
              {errors.company && <span id="model-company-error" className="required-field-error" role="alert">{errors.company}</span>}
              {companyLoadError && (
                <span role="alert">
                  {companyLoadError}{' '}
                  <button type="button" onClick={() => setReloadCompaniesKey((key) => key + 1)}>
                    Retry
                  </button>
                </span>
              )}
            </div>
            <div className="model-form-field">
              <label htmlFor="model-name">Model Name <span aria-hidden="true">*</span></label>
              <input
                id="model-name"
                type="text"
                placeholder="Model Name"
                value={name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'model-name-error' : undefined}
                onChange={(event) => {
                  setName(event.target.value);
                  if (event.target.value.trim()) setErrors((current) => ({ ...current, name: '' }));
                }}
              />
              {errors.name && <span id="model-name-error" className="required-field-error" role="alert">{errors.name}</span>}
            </div>
            <div className="model-form-actions">
              <button className="model-save-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                className="model-cancel-button"
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSaveError('');
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default ModelPage;
