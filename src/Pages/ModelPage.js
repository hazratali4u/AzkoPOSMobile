import React, { useMemo, useState } from 'react';

function ModelPage() {
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState({ company: '', name: '' });

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
    setIsEditing(true);
  };

  const openEditForm = (index) => {
    setName(models[index].name);
    setCompany(models[index].company);
    setEditingIndex(index);
    setErrors({ company: '', name: '' });
    setIsEditing(true);
  };

  const saveModel = (event) => {
    event.preventDefault();
    const nextErrors = {
      company: company.trim() ? '' : 'Company is required.',
      name: name.trim() ? '' : 'Model Name is required.',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (editingIndex === null) {
      setModels((current) => [...current, { name: name.trim(), company, active: true }]);
    } else {
      setModels((current) => current.map((model, index) => (
        index === editingIndex ? { ...model, name: name.trim(), company } : model
      )));
    }
    setIsEditing(false);
  };

  const toggleModel = (index) => {
    setModels((current) => current.map((model, modelIndex) => (
      modelIndex === index ? { ...model, active: !model.active } : model
    )));
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
          <div className="model-table-wrap">
            <table className="model-table">
              <thead>
                <tr>
                  <th scope="col">Model Name</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Active/Inactive</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="model-empty-state">
                      {models.length === 0 ? 'No models available.' : 'No models match your search.'}
                    </td>
                  </tr>
                ) : filteredModels.map((model) => (
                  <tr key={model.index} className={!model.active ? 'is-inactive' : ''}>
                    <td data-label="Model Name">{model.name}</td>
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
              >
                <option value="">Select Company</option>
              </select>
              {errors.company && <span id="model-company-error" className="required-field-error" role="alert">{errors.company}</span>}
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
              <button className="model-save-button" type="submit">Save</button>
              <button className="model-cancel-button" type="button" onClick={() => setIsEditing(false)}>
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
