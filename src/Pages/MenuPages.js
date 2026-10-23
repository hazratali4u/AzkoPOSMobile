import React from 'react';

function MenuWorkspace({ title, description, icon, workspaceLabel, testId }) {
  return (
    <div className="section-page" data-testid={testId}>
      <p className="eyebrow">WORKSPACE</p>
      <h1>{title}</h1>
      <p className="dashboard-subtitle">{description}</p>
      <section className="section-empty" aria-label={`${title} workspace`}>
        <span className="section-empty-mark"><i className={`mdi ${icon}`} aria-hidden="true" /></span>
        <h2>{workspaceLabel}</h2>
        <p>This dedicated page is ready for its menu-specific content.</p>
      </section>
    </div>
  );
}

export function PartyPage() {
  return (
    <MenuWorkspace
      title="Party"
      description="Party workspace"
      icon="mdi-account-group-outline"
      workspaceLabel="Party"
      testId="party-page"
    />
  );
}

export function UserPage() {
  return (
    <MenuWorkspace
      title="User"
      description="User workspace"
      icon="mdi-account-outline"
      workspaceLabel="User"
      testId="user-page"
    />
  );
}

export function GenericMenuPage({ title }) {
  return (
    <MenuWorkspace
      title={title}
      description={`${title} workspace`}
      icon="mdi-view-grid-outline"
      workspaceLabel={title}
      testId="menu-page"
    />
  );
}
