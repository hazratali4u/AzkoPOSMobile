import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import HomePage from './Pages/HomePage';
import UserContext from './UserContext';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      shopID: 1,
      name: 'Demo Mobile',
      address: 'shop# 14,LG Floor,Makkah Mobile Mall,Adyala Road, Rawalpindi',
      conactPerson: 'Afaq Ahmed',
      conactNumber: '03325526566',
    }),
  });
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
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        userID: 1,
        employeeName: 'Hazrat Ali',
        roleID: 1,
        connString: 'test-connection-string',
        menus: [
          { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
          { menuID: 3, menuName: 'Transactions', menuParentID: 0, menuType: 1 },
          { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
          { menuID: 12, menuName: 'POS', menuParentID: 3, menuURL: 'POS.aspx', menuType: 2 },
        ],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        shopID: 1,
        name: 'Demo Mobile',
        address: 'shop# 14,LG Floor,Makkah Mobile Mall,Adyala Road, Rawalpindi',
        conactPerson: 'Afaq Ahmed',
        conactNumber: '03325526566',
      }),
    });

  render(<App />);

  expect(window.location.pathname).toBe('/login');
  fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'demo' } });
  fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  await waitFor(() => expect(window.location.pathname).toBe('/dashboard'));
  expect(JSON.parse(sessionStorage.getItem('azkopos.user')).connString).toBe('test-connection-string');
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

  fireEvent.click(screen.getByRole('button', { name: /Transactions/ }));
  fireEvent.click(screen.getByRole('button', { name: 'POS' }));

  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Reports/ })).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Page for POS has not been created yet.');
  expect(screen.getByRole('heading', { level: 4, name: 'AzkoPOS' })).toBeInTheDocument();
  expect(screen.getByText('Hazrat Ali')).toBeInTheDocument();
  expect(screen.getByText('Role 1')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Setting/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Shop' }));
  expect(window.location.pathname).toBe('/setting/shop');
  expect(screen.getByRole('heading', { level: 1, name: 'Setting / Shop' })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByLabelText(/Shop Name/)).toHaveValue('Demo Mobile'));
});

test('keeps the authenticated menu after a hard refresh and clears it on logout', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      userID: 1,
      employeeName: 'Hazrat Ali',
      roleID: 1,
      connString: 'test-connection-string',
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

  expect(JSON.parse(sessionStorage.getItem('azkopos.user')).connString).toBe('test-connection-string');
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

test('rejects a successful response without a connection string', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      userID: 1,
      employeeName: 'Hazrat Ali',
      roleID: 1,
    }),
  });

  window.history.replaceState({}, '', '/login');
  render(<App />);
  fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'demo' } });
  fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login ID or password.');
  expect(window.location.pathname).toBe('/login');
  expect(sessionStorage.getItem('azkopos.user')).toBeNull();
});

test('shop URL opens the Shop page directly', async () => {
  window.history.replaceState({}, '', '/setting/shop');
  render(
    <UserContext.Provider value={{
      connString: 'test-connection-string',
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/setting/shop" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  expect(screen.getByRole('heading', { level: 1, name: 'Setting / Shop' })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByLabelText(/Shop Name/)).toHaveValue('Demo Mobile'));
  window.history.replaceState({}, '', '/login');
});

test('Shop page displays the shop details form design', () => {
  window.history.replaceState({}, '', '/setting/shop');
  render(
    <UserContext.Provider value={{
      connString: 'test-connection-string',
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/setting/shop" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  expect(screen.getByLabelText(/Shop Name/)).toBeInTheDocument();
  expect(screen.getByLabelText('Shop Address')).toBeInTheDocument();
  expect(screen.getByLabelText('Shop Contact Person')).toBeInTheDocument();
  expect(screen.getByLabelText('Contact Number')).toHaveAttribute('type', 'tel');
  expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

  return waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.azkopos.com/AzkoAPI/GetShopData',
      {
        method: 'GET',
        headers: {
          ConnectionString: 'test-connection-string',
        },
      },
    );
    expect(screen.getByLabelText(/Shop Name/)).toHaveValue('Demo Mobile');
    expect(screen.getByLabelText('Shop Address')).toHaveValue(
      'shop# 14,LG Floor,Makkah Mobile Mall,Adyala Road, Rawalpindi',
    );
    expect(screen.getByLabelText('Shop Contact Person')).toHaveValue('Afaq Ahmed');
    expect(screen.getByLabelText('Contact Number')).toHaveValue('03325526566');
    expect(document.querySelector('input[name="shopID"]')).toHaveValue('1');
  });
});

test('Shop page saves the edited details with the authenticated user and connection string', async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        shopID: 1,
        name: 'Demo Mobile',
        address: 'Shop address',
        conactPerson: 'Afaq Ahmed',
        conactNumber: '03325526566',
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      text: async () => 'Sucess',
    });

  window.history.replaceState({}, '', '/setting/shop');
  render(
    <UserContext.Provider value={{
      userID: 42,
      connString: 'test-connection-string',
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/setting/shop" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  await waitFor(() => expect(screen.getByLabelText(/Shop Name/)).toHaveValue('Demo Mobile'));
  fireEvent.change(screen.getByLabelText(/Shop Name/), { target: { value: 'Updated Shop' } });
  fireEvent.change(screen.getByLabelText('Shop Address'), { target: { value: 'Updated Address' } });
  fireEvent.change(screen.getByLabelText('Shop Contact Person'), { target: { value: 'Updated Contact' } });
  fireEvent.change(screen.getByLabelText('Contact Number'), { target: { value: '123456789' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));

  await waitFor(() => expect(screen.getByText('Shop details saved successfully.')).toBeInTheDocument());
  expect(global.fetch).toHaveBeenLastCalledWith(
    'https://api.azkopos.com/AzkoAPI/UpdateShop',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ConnectionString: 'test-connection-string',
      },
      body: JSON.stringify({
        Name: 'Updated Shop',
        Address: 'Updated Address',
        ConactPerson: 'Updated Contact',
        ConactNumber: '123456789',
        UserID: 42,
        ShopID: 1,
      }),
    },
  );
  window.history.replaceState({}, '', '/login');
});

test('Shop page requires a non-empty Shop Name before saving', async () => {
  window.history.replaceState({}, '', '/setting/shop');
  render(
    <UserContext.Provider value={{
      userID: 42,
      connString: 'test-connection-string',
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/setting/shop" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  const shopNameInput = await screen.findByLabelText(/Shop Name/);
  fireEvent.change(shopNameInput, { target: { value: '   ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));

  const validationMessage = screen.getByRole('alert');
  expect(validationMessage).toHaveTextContent('Shop Name is required.');
  expect(validationMessage).toHaveClass('shop-field-error');
  expect(shopNameInput).toHaveAttribute('aria-invalid', 'true');
  expect(global.fetch).toHaveBeenCalledTimes(1);

  fireEvent.change(shopNameInput, { target: { value: 'Valid Shop' } });
  expect(screen.queryByText('Shop Name is required.')).not.toBeInTheDocument();
  expect(shopNameInput).toHaveAttribute('aria-invalid', 'false');
  window.history.replaceState({}, '', '/login');
});

test('Shop page cancel reloads shop details and discards unsaved edits', async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        shopID: 1,
        name: 'Original Shop',
        address: 'Original Address',
        conactPerson: 'Original Contact',
        conactNumber: '111111111',
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        shopID: 1,
        name: 'Latest Shop',
        address: 'Latest Address',
        conactPerson: 'Latest Contact',
        conactNumber: '222222222',
      }),
    });

  window.history.replaceState({}, '', '/setting/shop');
  render(
    <UserContext.Provider value={{
      connString: 'test-connection-string',
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/setting/shop" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  await waitFor(() => expect(screen.getByLabelText(/Shop Name/)).toHaveValue('Original Shop'));
  fireEvent.change(screen.getByLabelText(/Shop Name/), { target: { value: 'Unsaved Edit' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

  await waitFor(() => expect(screen.getByLabelText(/Shop Name/)).toHaveValue('Latest Shop'));
  expect(screen.getByLabelText('Shop Address')).toHaveValue('Latest Address');
  expect(screen.getByLabelText('Shop Contact Person')).toHaveValue('Latest Contact');
  expect(screen.getByLabelText('Contact Number')).toHaveValue('222222222');
  expect(global.fetch).toHaveBeenLastCalledWith(
    'https://api.azkopos.com/AzkoAPI/GetShopData',
    {
      method: 'GET',
      headers: {
        ConnectionString: 'test-connection-string',
      },
    },
  );
  window.history.replaceState({}, '', '/login');
});

test.each([
  ['Shop', '/setting/shop'],
  ['Party', '/setting/party'],
  ['User', '/setting/user'],
])('%s opens its menu page or shows that it is not created', async (title, pathname) => {
  window.history.replaceState({}, '', pathname);
  render(
    <UserContext.Provider value={{
      connString: 'test-connection-string',
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
        { menuID: 7, menuName: 'Party', menuParentID: 1, menuURL: 'Party.aspx', menuType: 2 },
        { menuID: 8, menuName: 'User', menuParentID: 1, menuURL: 'User.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname={pathname} onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  if (title === 'Shop') {
    expect(screen.getByTestId('shop-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Setting / Shop' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText(/Shop Name/)).toHaveValue('Demo Mobile'));
  } else if (title === 'Party') {
    expect(screen.getByTestId('party-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Setting / Party' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search Party' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Party Name' })).toBeInTheDocument();
    expect(screen.getByText('No parties available.')).toBeInTheDocument();
  } else {
    expect(screen.getByRole('alert')).toHaveTextContent(`Page for ${title} has not been created yet.`);
  }
});

test('Party page opens and cancels the Add Party form', () => {
  window.history.replaceState({}, '', '/setting/party');
  render(
    <UserContext.Provider value={{
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 7, menuName: 'Party', menuParentID: 1, menuURL: 'Party.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/setting/party" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Add Party' }));
  expect(screen.getByRole('region', { name: 'Add party' })).toBeInTheDocument();
  expect(screen.getByLabelText('Customer')).not.toBeChecked();
  expect(screen.getByLabelText('Supplier')).toBeChecked();
  expect(screen.getByLabelText(/Party Name/)).toBeInTheDocument();
  expect(screen.getByLabelText('Address')).toBeInTheDocument();
  expect(screen.getByLabelText('Contact No')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('region', { name: 'Party list' })).toBeInTheDocument();
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
