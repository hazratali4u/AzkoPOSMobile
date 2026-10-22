import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import HomePage from './Pages/HomePage';
import UserContext from './UserContext';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
  sessionStorage.clear();
});

afterEach(() => {
  if (originalFetch) {
    global.fetch = originalFetch;
  } else {
    delete global.fetch;
  }
});

test('login opens the dashboard and page navigation keeps the shared shell', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      userID: 1,
      employeeName: 'Hazrat Ali',
      roleID: 1,
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 3, menuName: 'Transactions', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
        { menuID: 12, menuName: 'POS', menuParentID: 3, menuURL: 'POS.aspx', menuType: 2 },
      ],
    }),
  });

  render(<App />);

  expect(window.location.pathname).toBe('/login');
  fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'demo' } });
  fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  await waitFor(() => expect(window.location.pathname).toBe('/dashboard'));
  expect(global.fetch).toHaveBeenCalledWith(
    'https://api.azkopos.com/AzkoAPI/GetUserData',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Username: 'demo',
        Password: 'password',
        TypeID: 1,
      }),
    },
  );

  expect(window.location.pathname).toBe('/dashboard');
  expect(screen.getByRole('heading', { name: 'Welcome to AzkoPOS' })).toBeInTheDocument();
  expect(screen.getByText('Hazrat Ali')).toBeInTheDocument();
  expect(screen.getByText('Role 1')).toBeInTheDocument();
  expect(screen.getByTestId('breadcrumb-current')).toHaveTextContent('Dashboard');

  fireEvent.click(screen.getByRole('button', { name: /Transactions/ }));
  fireEvent.click(screen.getByRole('button', { name: 'POS' }));

  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Reports/ })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: 'POS' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 4, name: 'AzkoPOS' })).toBeInTheDocument();
  expect(screen.getByText('Hazrat Ali')).toBeInTheDocument();
  expect(screen.getByText('Role 1')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Setting/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Shop' }));
  expect(window.location.pathname).toBe('/setting/shop');
  expect(screen.getByRole('heading', { level: 1, name: 'Shop' })).toBeInTheDocument();
  expect(screen.getByTestId('breadcrumb-current')).toHaveTextContent('Setting / Shop');
});

test('keeps the authenticated menu after a hard refresh and clears it on logout', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      userID: 1,
      employeeName: 'Hazrat Ali',
      roleID: 1,
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
      ],
    }),
  });

  window.history.replaceState({}, '', '/login');
  const firstRender = render(<App />);
  fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'demo' } });
  fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  await waitFor(() => expect(window.location.pathname).toBe('/dashboard'));

  firstRender.unmount();
  render(<App />);

  expect(screen.getByRole('button', { name: /Setting/ })).toBeInTheDocument();
  expect(screen.getByText('Hazrat Ali')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Hazrat Ali/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

  expect(sessionStorage.getItem('azkopos.user')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Login Form' })).toBeInTheDocument();
});

test('shows an error and stays on login when the login request fails', async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    text: async () => '',
  });

  window.history.replaceState({}, '', '/login');
  render(<App />);
  fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'demo' } });
  fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login ID or password.');
  expect(window.location.pathname).toBe('/login');
});

test('rejects a successful response without valid user details', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => null,
  });

  window.history.replaceState({}, '', '/login');
  render(<App />);
  fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'demo' } });
  fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login ID or password.');
  expect(window.location.pathname).toBe('/login');
});

test('shop URL opens the Shop page directly', () => {
  window.history.replaceState({}, '', '/setting/shop');
  render(
    <UserContext.Provider value={{
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/setting/shop" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  expect(screen.getByRole('heading', { level: 1, name: 'Shop' })).toBeInTheDocument();
  window.history.replaceState({}, '', '/login');
});

test('sidebar displays only groups and pages assigned by the API', () => {
  const onNavigate = jest.fn();
  render(
    <UserContext.Provider value={{
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 3, menuName: 'Transactions', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
        { menuID: 12, menuName: 'POS', menuParentID: 3, menuURL: 'POS.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/dashboard" onNavigate={onNavigate} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  expect(screen.getByRole('button', { name: /Setting/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Transactions/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Reports/ })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Transactions/ }));
  fireEvent.click(screen.getByRole('button', { name: 'POS' }));
  expect(onNavigate).toHaveBeenCalledWith('/transactions/pos');
});

test('root URL renders the login page without briefly showing the home page', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);

  expect(window.location.pathname).toBe('/login');
  expect(screen.getByRole('heading', { name: 'Login Form' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Welcome to AzkoPOS' })).not.toBeInTheDocument();
});
