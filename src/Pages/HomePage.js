import React, { useState } from 'react';

const navigation = [
  { title: 'Setting', icon: '⚙', pages: ['Shop', 'Party', 'User', 'Expense Head'] },
  { title: 'Item Management', icon: '▦', pages: ['Company', 'Model', 'RamRom'] },
  { title: 'Transactions', icon: '⇄', pages: ['Purchase', 'POS'] },
  { title: 'Accounts', icon: '▤', pages: ['Expense Entry', 'Customer Receipt', 'Supplier Payment'] },
  {
    title: 'Reports',
    icon: '▥',
    pages: ['Document Wise Report', 'Stock Report', 'Expense Report', 'Customer Ledger', 'Supplier Ledger', 'Profit & Loss Report'],
  },
];

const weeklyData = [
  { day: 'Sun', sales: 420, purchases: 260, expenses: 110 },
  { day: 'Mon', sales: 680, purchases: 360, expenses: 180 },
  { day: 'Tue', sales: 520, purchases: 450, expenses: 160 },
  { day: 'Wed', sales: 820, purchases: 540, expenses: 270 },
  { day: 'Thu', sales: 610, purchases: 390, expenses: 210 },
  { day: 'Fri', sales: 940, purchases: 630, expenses: 330 },
  { day: 'Sat', sales: 760, purchases: 470, expenses: 240 },
];

function Dashboard() {
  const maxValue = Math.max(...weeklyData.flatMap((item) => [item.sales, item.purchases, item.expenses]));

  return (
    <>
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Welcome to AzkoPOS</h1>
          <p className="dashboard-subtitle">Your business at a glance.</p>
        </div>
        <span className="date-chip">Today · {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      <section className="metric-grid" aria-label="Monthly totals">
        <article className="metric-card metric-sales">
          <div className="metric-topline"><span>Sales</span><span className="metric-mark">↗</span></div>
          <strong>$0.00</strong><span className="metric-caption">This month</span>
        </article>
        <article className="metric-card metric-purchases">
          <div className="metric-topline"><span>Purchases</span><span className="metric-mark">↓</span></div>
          <strong>$0.00</strong><span className="metric-caption">This month</span>
        </article>
        <article className="metric-card metric-expenses">
          <div className="metric-topline"><span>Expenses</span><span className="metric-mark">−</span></div>
          <strong>$0.00</strong><span className="metric-caption">This month</span>
        </article>
      </section>

      <section className="activity-section">
        <div className="activity-header">
          <div><p className="eyebrow">ACTIVITY</p><h2>Weekly performance</h2></div>
          <span className="period-label">Last 7 days</span>
        </div>
        <div className="today-grid">
          <div className="today-stat"><span>Today sales</span><strong>$0.00</strong><i className="today-spark spark-sales" /></div>
          <div className="today-stat"><span>Today purchases</span><strong>$0.00</strong><i className="today-spark spark-purchases" /></div>
          <div className="today-stat"><span>Today expenses</span><strong>$0.00</strong><i className="today-spark spark-expenses" /></div>
        </div>
        <div className="chart-area" role="img" aria-label="Weekly sales, purchases, and expenses chart">
          <div className="chart-y-labels"><span>$1k</span><span>$750</span><span>$500</span><span>$250</span><span>$0</span></div>
          <div className="chart-plot">
            {[0, 1, 2, 3, 4].map((line) => <span className="chart-gridline" key={line} />)}
            <div className="chart-columns">
              {weeklyData.map((item) => (
                <div className="chart-day" key={item.day}>
                  <div className="bar-group">
                    <i className="chart-bar bar-purchases" style={{ height: `${(item.purchases / maxValue) * 100}%` }} />
                    <i className="chart-bar bar-expenses" style={{ height: `${(item.expenses / maxValue) * 100}%` }} />
                    <i className="chart-bar bar-sales" style={{ height: `${(item.sales / maxValue) * 100}%` }} />
                  </div>
                  <span>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-legend"><span><i className="legend-purchases" />Purchases</span><span><i className="legend-expenses" />Expenses</span><span><i className="legend-sales" />Sales</span></div>
      </section>
    </>
  );
}

function HomePage({ onLogout }) {
  const [activePage, setActivePage] = useState('Dashboard');
  const [expandedMenu, setExpandedMenu] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const selectPage = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="home-page-shell">
      <button className={`sidebar-backdrop${mobileMenuOpen ? ' is-visible' : ''}`} aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />
      <aside className={`home-sidebar${mobileMenuOpen ? ' is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">A</div>
          <div><h4>AzkoPOS</h4><small>BUSINESS MANAGER</small></div>
        </div>
        <p className="sidebar-section-label">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <button className={`nav-link${activePage === 'Dashboard' ? ' is-active' : ''}`} onClick={() => selectPage('Dashboard')}>
            <span className="nav-icon">⌂</span><span>Dashboard</span>
          </button>
          {navigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <button className={`nav-link${group.pages.includes(activePage) ? ' is-active' : ''}`} aria-expanded={expandedMenu === group.title} onClick={() => setExpandedMenu(expandedMenu === group.title ? '' : group.title)}>
                <span className="nav-icon">{group.icon}</span><span>{group.title}</span><span className={`nav-chevron${expandedMenu === group.title ? ' is-expanded' : ''}`}>⌄</span>
              </button>
              {expandedMenu === group.title && <div className="sub-menu">{group.pages.map((page) => <button className={`sub-nav-link${activePage === page ? ' is-active' : ''}`} key={page} onClick={() => selectPage(page)}>{page}</button>)}</div>}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom"><span className="online-indicator" />All systems operational</div>
      </aside>

      <div className="home-main-area">
        <header className="home-topbar">
          <div className="topbar-left">
            <button className="menu-toggle" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}>☰</button>
            <span className="breadcrumb-root">AzkoPOS</span><span className="breadcrumb-divider">/</span><span className="breadcrumb-current">{activePage}</span>
          </div>
          <div className="topbar-profile-wrap">
            <button className="topbar-profile" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}>
              <span className="profile-avatar">AS</span><span className="profile-details"><strong>Admin User</strong><small>Administrator</small></span><span className="profile-chevron">⌄</span>
            </button>
            {profileOpen && <div className="profile-menu"><button onClick={onLogout}>Sign out</button></div>}
          </div>
        </header>
        <main className="home-main">
          {activePage === 'Dashboard' ? <Dashboard /> : <div className="section-page"><p className="eyebrow">WORKSPACE</p><h1>{activePage}</h1><p className="dashboard-subtitle">Manage your {activePage.toLowerCase()} in AzkoPOS.</p><div className="section-empty"><span className="section-empty-mark">{navigation.find((group) => group.pages.includes(activePage))?.icon || '▦'}</span><h2>{activePage}</h2><p>This workspace is ready for your {activePage.toLowerCase()} data.</p></div></div>}
        </main>
        <footer className="home-footer"><span>Copyright © AzkoIT 2025</span><span>AzkoPOS · Business Manager</span></footer>
      </div>
    </div>
  );
}

export default HomePage;
