import React, { useState } from 'react';
import { useUser } from '../UserContext';
import { GenericMenuPage, PartyPage, UserPage } from './MenuPages';
import ShopPage from './ShopPage';

const menuIcons = {
  1: 'mdi-settings',
  2: 'mdi-view-dashboard-outline',
  3: 'mdi-swap-horizontal',
  4: 'mdi-file-document-outline',
  5: 'mdi-chart-bar',
  6: 'mdi-store-outline',
};

function buildNavigation(menus) {
  if (!Array.isArray(menus)) {
    return [];
  }

  return menus
    .filter((menu) => Number(menu.menuType) === 1 && Number(menu.menuParentID) === 0)
    .map((parent) => ({
      id: parent.menuID,
      title: parent.menuName,
      icon: menuIcons[parent.menuID] || 'mdi-view-grid-outline',
      pages: menus
        .filter((menu) => Number(menu.menuType) === 2 && Number(menu.menuParentID) === Number(parent.menuID))
        .map((menu) => ({ id: menu.menuID, title: menu.menuName })),
    }))
    .filter((group) => group.pages.length > 0);
}

const weeklyData = [
  { day: 'Sun', sales: 420, purchases: 260, expenses: 110 },
  { day: 'Mon', sales: 680, purchases: 360, expenses: 180 },
  { day: 'Tue', sales: 520, purchases: 450, expenses: 160 },
  { day: 'Wed', sales: 820, purchases: 540, expenses: 270 },
  { day: 'Thu', sales: 610, purchases: 390, expenses: 210 },
  { day: 'Fri', sales: 940, purchases: 630, expenses: 330 },
  { day: 'Sat', sales: 760, purchases: 470, expenses: 240 },
];

const dashboardSeries = [
  { key: 'purchases', label: 'Purchase', color: '#ff3ca6' },
  { key: 'expenses', label: 'Expenses', color: '#3f50f6' },
  { key: 'sales', label: 'Sales', color: '#ffab2d' },
];

function makeChartPoints(key, maxValue, width = 700, height = 205, inset = 12) {
  const plotWidth = width - inset * 2;
  const plotHeight = height - inset * 2;
  return weeklyData.map((item, index) => {
    const x = inset + (index * plotWidth) / (weeklyData.length - 1);
    const y = height - inset - (item[key] / maxValue) * plotHeight;
    return `${x},${y}`;
  }).join(' ');
}

const toSlug = (value) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Dashboard() {
  const maxValue = Math.ceil(Math.max(...weeklyData.flatMap((item) => [item.sales, item.purchases, item.expenses])) / 250) * 250;
  const summaryCards = [
    { label: 'Today Sales', className: 'sales', points: '0,34 12,25 24,30 36,16 48,23 60,10 72,16 80,5' },
    { label: 'Today Purchase', className: 'purchase', points: '0,30 12,18 24,25 36,10 48,19 60,14 72,25 80,9' },
    { label: 'Today Expenes', className: 'expense', points: '0,34 12,28 24,16 36,22 48,12 60,19 72,8 80,14' },
  ];

  return (
    <>
      <div className="dashboard-heading">
        <h1 aria-label="Welcome to AzkoPOS">Welcome to AzkoPOS! <span>a software by AzkoIT.</span></h1>
      </div>

      <div className="dashboard-layout">
        <section className="metric-grid" aria-label="Monthly totals">
          <article className="metric-card metric-sales">
            <div className="metric-topline">
              <div><p>Sales</p><strong>$0.00</strong></div>
              <i className="mdi mdi-basket metric-icon" aria-hidden="true" />
            </div>
            <h6>This month</h6>
          </article>
          <article className="metric-card metric-purchases">
            <div className="metric-topline">
              <div><p>Purchase</p><strong>$0.00</strong></div>
              <i className="mdi mdi-cube-outline metric-icon" aria-hidden="true" />
            </div>
            <h6>This month</h6>
          </article>
          <article className="metric-card metric-expenses">
            <div className="metric-topline">
              <div><p>Expenses</p><strong>$0.00</strong></div>
              <i className="mdi mdi-briefcase-outline metric-icon" aria-hidden="true" />
            </div>
            <h6>This month</h6>
          </article>
        </section>

        <section className="activity-section" aria-label="Sales, purchases, and expenses">
          <div className="today-grid">
            {summaryCards.map((card) => (
              <article className="today-card" key={card.className}>
                <p>{card.label}</p>
                <div className="today-card-content">
                  <strong>$0.00</strong>
                  <svg className={`today-spark spark-${card.className}`} viewBox="0 0 80 40" role="img" aria-label={`${card.label} trend`}>
                    <polyline points={card.points} />
                  </svg>
                </div>
              </article>
            ))}
          </div>

          <div className="dashboard-chart" role="img" aria-label="Weekly purchase, expense, and sales chart">
            <svg viewBox="0 0 760 265" preserveAspectRatio="none" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((line) => {
                const y = 12 + (line * 205) / 4;
                return <line className="dashboard-chart-grid" key={line} x1="48" x2="748" y1={y} y2={y} />;
              })}
              {[0, 1, 2, 3, 4].map((line) => (
                <text className="dashboard-chart-y-label" key={line} x="0" y={16 + (line * 205) / 4}>
                  {`$${Math.round((maxValue * (4 - line)) / 4)}`}
                </text>
              ))}
              {dashboardSeries.map((series) => (
                <polyline
                  className={`dashboard-chart-line chart-line-${series.key}`}
                  key={series.key}
                  points={makeChartPoints(series.key, maxValue, 700, 205, 0)}
                  transform="translate(48 12)"
                />
              ))}
              {weeklyData.map((item, index) => {
                const x = 48 + (index * 700) / (weeklyData.length - 1);
                return <text className="dashboard-chart-x-label" key={item.day} x={x} y="250" textAnchor="middle">{item.day}</text>;
              })}
            </svg>
          </div>
          <div className="chart-legend">
            {dashboardSeries.map((series) => (
              <span key={series.key}><i className={`legend-${series.key}`} />{series.label}</span>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function HomePage({ pathname, onNavigate, onLogout }) {
  const user = useUser();
  const navigation = buildNavigation(user && user.menus);
  const activeEntry = navigation
    .flatMap((group) => group.pages.map((page) => ({ group, page })))
    .find(({ group, page }) => pathname === `/${toSlug(group.title)}/${toSlug(page.title)}`);
  const activePage = pathname === '/dashboard' ? 'Dashboard' : activeEntry?.page.title || 'Dashboard';
  const menuPageComponents = {
    shop: ShopPage,
    party: PartyPage,
    user: UserPage,
  };
  const MenuPageComponent = menuPageComponents[activePage.toLowerCase()] || GenericMenuPage;
  const employeeName = user && user.employeeName ? user.employeeName : 'Admin User';
  const roleLabel = user && user.roleID != null ? `Role ${user.roleID}` : 'Administrator';
  const [expandedMenu, setExpandedMenu] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarMini, setSidebarMini] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleNavigation = () => {
    if (window.innerWidth <= 900) {
      setMobileMenuOpen(!mobileMenuOpen);
      return;
    }
    setSidebarMini(!sidebarMini);
  };

  const selectPage = (page, group) => {
    if (!page) {
      onNavigate('/dashboard');
    } else {
      onNavigate(`/${toSlug(group.title)}/${toSlug(page.title)}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className={`home-page-shell${sidebarMini ? ' is-sidebar-mini' : ''}`}>
      <button className={`sidebar-backdrop${mobileMenuOpen ? ' is-visible' : ''}`} aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />
      <aside className={`home-sidebar${mobileMenuOpen ? ' is-open' : ''}`}>
        <div className="sidebar-brand">
          <img className="sidebar-brand-logo" src="/assets/images/logo.svg" alt="AzkoPOS" />
          <img className="sidebar-brand-mini" src="/assets/images/logo-mini.svg" alt="AzkoPOS" />
          <h4 className="visually-hidden">AzkoPOS</h4>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <button className={`nav-link${activePage === 'Dashboard' ? ' is-active' : ''}`} title="Dashboard" onClick={() => selectPage(null)}>
            <i className="mdi mdi-home nav-icon" aria-hidden="true" /><span className="nav-title">Dashboard</span>
          </button>
          {navigation.map((group) => (
            <div className="nav-group" key={group.id}>
              <button className={`nav-link${group.pages.some((page) => page.title === activePage) ? ' is-active' : ''}`} title={group.title} aria-expanded={expandedMenu === group.title} onClick={() => setExpandedMenu(expandedMenu === group.title ? '' : group.title)}>
                <i className={`mdi ${group.icon} nav-icon`} aria-hidden="true" /><span className="nav-title">{group.title}</span><i className={`mdi mdi-chevron-down nav-chevron${expandedMenu === group.title ? ' is-expanded' : ''}`} aria-hidden="true" />
              </button>
              {expandedMenu === group.title && <div className="sub-menu">{group.pages.map((page) => <button className={`sub-nav-link${activePage === page.title ? ' is-active' : ''}`} key={page.id} onClick={() => selectPage(page, group)}>{page.title}</button>)}</div>}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom"><span className="online-indicator" /><span>All systems operational</span></div>
      </aside>

      <div className="home-main-area">
        <header className="home-topbar">
          <div className="topbar-left">
            <img className="mobile-brand-logo" src="/assets/images/logo-mini.svg" alt="AzkoPOS" />
            <button className="menu-toggle" aria-label={mobileMenuOpen ? 'Close navigation' : 'Toggle navigation'} aria-expanded={mobileMenuOpen} onClick={toggleNavigation}>☰</button>
          </div>
          <div className="topbar-profile-wrap">
            <button className="topbar-profile" aria-label={`Open ${employeeName} menu`} aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)}>
              <img className="profile-avatar" src="/assets/images/faces-clipart/pic-3.png" alt="" />
              <span className="profile-details"><strong>{employeeName}</strong><small>{roleLabel}</small></span>
              <span className="profile-chevron">⌄</span>
            </button>
            {profileOpen && <div className="profile-menu"><button onClick={onLogout}>Sign out</button></div>}
          </div>
        </header>
        <main className="home-main">
          {activePage === 'Dashboard'
            ? <Dashboard />
            : <MenuPageComponent key={activeEntry?.page.id} title={activePage} />}
        </main>
        <footer className="home-footer"><span>Copyright © AzkoIT 2025</span><span>AzkoPOS · Business Manager</span></footer>
      </div>
    </div>
  );
}

export default HomePage;
