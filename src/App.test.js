import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import CompanyPage from './Pages/CompanyPage';
import HomePage from './Pages/HomePage';
import ModelPage from './Pages/ModelPage';
import RamRomPage from './Pages/RamRomPage';
import UserPage from './Pages/UserPage';
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

test('shows the copyright notice on the login page', () => {
  window.history.replaceState({}, '', '/login');
  render(<App />);

  expect(screen.getByText('Copyright © AzkoIT 2025')).toBeInTheDocument();
});

test('centers the copyright notice in the dashboard footer', () => {
  render(
    <UserContext.Provider value={{ menus: [] }}>
      <HomePage pathname="/dashboard" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  const footer = document.querySelector('.home-footer');
  expect(footer).toHaveTextContent('Copyright © AzkoIT 2025');
  expect(footer.children).toHaveLength(1);
  expect(footer).not.toHaveTextContent('AzkoPOS · Business Manager');
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

test('shows a red error beside the password when the login request fails', async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    text: async () => '',
  });

  window.history.replaceState({}, '', '/login');
  render(<App />);
  fireEvent.change(screen.getByLabelText('Username *'), { target: { value: 'demo' } });
  fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(await screen.findByText('Invalid login ID or password.')).toHaveClass('required-field-error');
  expect(screen.getByLabelText('Password *')).toHaveAttribute('aria-describedby', 'password-error');
  expect(window.location.pathname).toBe('/login');
});

test('shows separate red validation messages beside empty login fields without submitting', () => {
  window.history.replaceState({}, '', '/login');
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(screen.getByText('Username is required.')).toHaveClass('required-field-error');
  expect(screen.getByText('Password is required.')).toHaveClass('required-field-error');
  expect(screen.getByLabelText('Username *')).toHaveAttribute('aria-describedby', 'username-error');
  expect(screen.getByLabelText('Password *')).toHaveAttribute('aria-describedby', 'password-error');
  expect(global.fetch).not.toHaveBeenCalled();
});

test.each([
  ['Username', 'Username is required.'],
  ['Password', 'Password is required.'],
])('shows a red validation message beside %s when it is empty', (field, message) => {
  window.history.replaceState({}, '', '/login');
  render(<App />);
  fireEvent.change(screen.getByLabelText('Username *'), {
    target: { value: field === 'Username' ? '' : 'demo' },
  });
  fireEvent.change(screen.getByLabelText('Password *'), {
    target: { value: field === 'Password' ? '' : 'password' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(screen.getByText(message)).toHaveClass('required-field-error');
  expect(screen.getByLabelText(`${field} *`)).toHaveAttribute(
    'aria-describedby',
    field === 'Username' ? 'username-error' : 'password-error',
  );
  expect(global.fetch).not.toHaveBeenCalled();
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

  expect(await screen.findByText('Invalid login ID or password.')).toHaveClass('required-field-error');
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

  expect(await screen.findByText('Invalid login ID or password.')).toHaveClass('required-field-error');
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

test('Shop page shows a red validation message for an empty or whitespace-only Shop Name', async () => {
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
  await waitFor(() => expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled());
  fireEvent.change(shopNameInput, { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));

  expect(screen.getByRole('alert')).toHaveTextContent('Shop Name is required.');
  expect(screen.getByRole('alert')).toHaveClass('required-field-error');
  expect(shopNameInput).toHaveAttribute('aria-invalid', 'true');
  expect(global.fetch).toHaveBeenCalledTimes(1);

  fireEvent.change(shopNameInput, { target: { value: '   ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Update' }));

  expect(screen.getByRole('alert')).toHaveTextContent('Shop Name is required.');
  expect(screen.getByRole('alert')).toHaveClass('required-field-error');
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
  ['Expense Head', '/setting/expense-head'],
])('%s opens its menu page', async (title, pathname) => {
  if (title === 'User') {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
  }

  window.history.replaceState({}, '', pathname);
  render(
    <UserContext.Provider value={{
      connString: 'test-connection-string',
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 6, menuName: 'Shop', menuParentID: 1, menuURL: 'Shop.aspx', menuType: 2 },
        { menuID: 7, menuName: 'Party', menuParentID: 1, menuURL: 'Party.aspx', menuType: 2 },
        { menuID: 8, menuName: 'User', menuParentID: 1, menuURL: 'User.aspx', menuType: 2 },
        { menuID: 9, menuName: 'Expense Head', menuParentID: 1, menuURL: 'ExpenseHead.aspx', menuType: 2 },
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
  } else if (title === 'Expense Head') {
    expect(screen.getByTestId('expense-head-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Setting / Expense Head' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search Expense Head' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Expense Head Name' })).toBeInTheDocument();
    expect(screen.getByText('No expense heads available.')).toBeInTheDocument();
  } else {
    expect(screen.getByTestId('user-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Setting / User' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search User' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Login Name' })).toBeInTheDocument();
    expect(await screen.findByText('No users available.')).toBeInTheDocument();
  }
});

test('Expense Head page adds, edits, searches, and changes active status', () => {
  window.history.replaceState({}, '', '/setting/expense-head');
  render(
    <UserContext.Provider value={{
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 9, menuName: 'Expense Head', menuParentID: 1, menuURL: 'ExpenseHead.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/setting/expense-head" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Add Expense Head' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('Expense Head Name is required.')).toHaveClass('required-field-error');
  expect(screen.getByLabelText(/Expense Head Name/)).toHaveAttribute(
    'aria-describedby',
    'expense-head-name-error',
  );

  fireEvent.change(screen.getByLabelText(/Expense Head Name/), { target: { value: 'Travel' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByRole('cell', { name: 'Travel' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Edit Travel' }));
  fireEvent.change(screen.getByLabelText(/Expense Head Name/), { target: { value: 'Transport' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByRole('cell', { name: 'Transport' })).toBeInTheDocument();

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search Expense Head' }), { target: { value: 'missing' } });
  expect(screen.getByText('No expense heads match your search.')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search Expense Head' }), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Deactivate Transport' }));
  expect(screen.getByRole('button', { name: 'Activate Transport' })).toBeInTheDocument();
  window.history.replaceState({}, '', '/login');
});

test('User page adds a user to the list and can cancel the form', async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    .mockResolvedValueOnce({
      ok: true,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{
        userID: 3,
        loginID: 'demo',
        password: 'secret',
        employeeName: 'Demo Employee',
        roleID: 2,
        status: 'Active',
        role: 'Data Entry',
      }],
    });

  window.history.replaceState({}, '', '/setting/user');
  render(
    <UserContext.Provider value={{
      userID: 1,
      connString: 'test-connection-string',
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 8, menuName: 'User', menuParentID: 1, menuURL: 'User.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/setting/user" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
  expect(screen.getByRole('region', { name: 'Add user' })).toBeInTheDocument();
  expect(screen.getByLabelText('Admin')).toBeChecked();
  expect(screen.getByLabelText('Data Entry')).not.toBeChecked();

  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('Login Name is required.')).toHaveClass('required-field-error');
  expect(screen.getByText('Password is required.')).toHaveClass('required-field-error');
  expect(screen.getByText('Employee Name is required.')).toHaveClass('required-field-error');

  fireEvent.change(screen.getByLabelText(/Login Name/), { target: { value: 'demo' } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret' } });
  fireEvent.change(screen.getByLabelText(/Employee Name/), { target: { value: 'Demo Employee' } });
  expect(screen.queryByText('Login Name is required.')).not.toBeInTheDocument();
  expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();
  expect(screen.queryByText('Employee Name is required.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Data Entry'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => {
    expect(screen.getByRole('cell', { name: 'demo' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Demo Employee' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Data Entry' })).toBeInTheDocument();
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://api.azkopos.com/AzkoAPI/InsertUpdateUser',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConnectionString: 'test-connection-string',
        },
        body: JSON.stringify({
          UserID: 0,
          LoginID: 'demo',
          Password: 'secret',
          EmployeeName: 'Demo Employee',
          RoleID: 2,
          CreateUpdatedBy: 1,
          TypeID: 1,
        }),
      },
    );
  });

  expect(screen.getByText('User saved successfully.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add User' }));
  expect(screen.queryByText('User saved successfully.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('region', { name: 'User list' })).toBeInTheDocument();
  window.history.replaceState({}, '', '/login');
});

test('User page saves edits with the selected user ID', async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{
        userID: 2,
        loginID: 'test',
        password: 'test',
        employeeName: 'DEO',
        roleID: 2,
        status: 'Active',
        role: 'Data Entry',
      }],
    })
    .mockResolvedValueOnce({
      ok: true,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{
        userID: 2,
        loginID: 'test-updated',
        password: 'updated',
        employeeName: 'DEO Updated',
        roleID: 1,
        status: 'Active',
        role: 'Admin',
      }],
    });

  render(
    <UserContext.Provider value={{ userID: 1, connString: 'test-connection-string' }}>
      <UserPage />
    </UserContext.Provider>,
  );

  fireEvent.click(await screen.findByRole('button', { name: 'Edit test' }));
  fireEvent.change(screen.getByLabelText(/Login Name/), { target: { value: 'test-updated' } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'updated' } });
  fireEvent.change(screen.getByLabelText(/Employee Name/), { target: { value: 'DEO Updated' } });
  fireEvent.click(screen.getByLabelText('Admin'));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('cell', { name: 'DEO Updated' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenNthCalledWith(
    2,
    'https://api.azkopos.com/AzkoAPI/InsertUpdateUser',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ConnectionString: 'test-connection-string',
      },
      body: JSON.stringify({
        UserID: 2,
        LoginID: 'test-updated',
        Password: 'updated',
        EmployeeName: 'DEO Updated',
        RoleID: 1,
        CreateUpdatedBy: 1,
        TypeID: 2,
      }),
    },
  );
});

test('User page sends inactive and active status changes to the API', async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{
        userID: 2,
        loginID: 'test',
        password: 'test',
        employeeName: 'DEO',
        roleID: 2,
        status: 'Active',
        role: 'Data Entry',
      }],
    })
    .mockResolvedValueOnce({ ok: true })
    .mockResolvedValueOnce({ ok: true });

  render(
    <UserContext.Provider value={{ userID: 1, connString: 'test-connection-string' }}>
      <UserPage />
    </UserContext.Provider>,
  );

  fireEvent.click(await screen.findByRole('button', { name: 'Deactivate test' }));
  expect(await screen.findByRole('button', { name: 'Activate test' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenNthCalledWith(
    2,
    'https://api.azkopos.com/AzkoAPI/InsertUpdateUser',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ConnectionString: 'test-connection-string',
      },
      body: JSON.stringify({
        UserID: 2,
        LoginID: 'test',
        Password: 'test',
        EmployeeName: 'DEO',
        RoleID: 2,
        CreateUpdatedBy: 1,
        TypeID: 3,
      }),
    },
  );

  fireEvent.click(screen.getByRole('button', { name: 'Activate test' }));
  expect(await screen.findByRole('button', { name: 'Deactivate test' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenNthCalledWith(
    3,
    'https://api.azkopos.com/AzkoAPI/InsertUpdateUser',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ConnectionString: 'test-connection-string',
      },
      body: JSON.stringify({
        UserID: 2,
        LoginID: 'test',
        Password: 'test',
        EmployeeName: 'DEO',
        RoleID: 2,
        CreateUpdatedBy: 1,
        TypeID: 4,
      }),
    },
  );
});

test('User page loads users from the API and keeps IDs hidden', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [
      {
        userID: 1,
        loginID: 'Admin',
        password: 'myadmin',
        employeeName: 'Hazrat Ali',
        roleID: 1,
        status: 'Active',
        role: 'Admin',
      },
      {
        userID: 2,
        loginID: 'test',
        password: 'test',
        employeeName: 'DEO',
        roleID: 2,
        status: 'Active',
        role: 'Data Entry',
      },
    ],
  });

  render(
    <UserContext.Provider value={{ connString: 'test-connection-string' }}>
      <UserPage />
    </UserContext.Provider>,
  );

  expect(await screen.findByRole('cell', { name: 'Hazrat Ali' })).toBeInTheDocument();
  expect(screen.getAllByRole('cell', { name: 'Admin' })).toHaveLength(2);
  expect(screen.getByRole('cell', { name: 'DEO' })).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: 'Data Entry' })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Login Name' })).toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'userID' })).not.toBeInTheDocument();
  expect(screen.queryByRole('columnheader', { name: 'roleID' })).not.toBeInTheDocument();
  expect(document.querySelector('input[name="userID"]')).toHaveAttribute('type', 'hidden');
  expect(document.querySelector('input[name="userID"]')).toHaveValue('1');
  expect(document.querySelector('input[name="roleID"]')).toHaveAttribute('type', 'hidden');
  expect(document.querySelector('input[name="roleID"]')).toHaveValue('1');
  expect(global.fetch).toHaveBeenCalledWith(
    'https://api.azkopos.com/AzkoAPI/GetAllUserData?TypeID=2',
    {
      method: 'GET',
      headers: {
        ConnectionString: 'test-connection-string',
      },
    },
  );
});

test('Party appears after User in the sidebar menu', () => {
  render(
    <UserContext.Provider value={{
      menus: [
        { menuID: 1, menuName: 'Setting', menuParentID: 0, menuType: 1 },
        { menuID: 7, menuName: 'Party', menuParentID: 1, menuURL: 'Party.aspx', menuType: 2 },
        { menuID: 8, menuName: 'User', menuParentID: 1, menuURL: 'User.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/dashboard" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Setting' }));

  const settingLinks = screen.getAllByRole('button')
    .filter((button) => ['User', 'Party'].includes(button.textContent));
  expect(settingLinks.map((button) => button.textContent)).toEqual(['User', 'Party']);
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

  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('Party Name is required.')).toHaveClass('required-field-error');
  expect(screen.getByLabelText(/Party Name/)).toHaveAttribute('aria-describedby', 'party-name-error');
  fireEvent.change(screen.getByLabelText(/Party Name/), { target: { value: 'Demo Party' } });
  expect(screen.queryByText('Party Name is required.')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('region', { name: 'Party list' })).toBeInTheDocument();
  window.history.replaceState({}, '', '/login');
});

test('Company page shows a red message beside the required Company Name', () => {
  render(<CompanyPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Add Company' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(screen.getByText('Company Name is required.')).toHaveClass('required-field-error');
  expect(screen.getByLabelText(/Company Name/)).toHaveAttribute('aria-describedby', 'company-name-error');
});

test('Model page shows red messages beside both required fields', () => {
  render(<ModelPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Add Model' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(screen.getByText('Company is required.')).toHaveClass('required-field-error');
  expect(screen.getByText('Model Name is required.')).toHaveClass('required-field-error');
  expect(screen.getByLabelText(/Company/)).toHaveAttribute('aria-describedby', 'model-company-error');
  expect(screen.getByLabelText(/Model Name/)).toHaveAttribute('aria-describedby', 'model-name-error');
});

test('RamRom page shows a red message beside the required RamRom Name', () => {
  render(<RamRomPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Add RamRom' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(screen.getByText('RamRom Name is required.')).toHaveClass('required-field-error');
  expect(screen.getByLabelText(/RamRom Name/)).toHaveAttribute('aria-describedby', 'ramrom-name-error');
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

test('sidebar expands the active menu group when opening a menu URL directly', () => {
  render(
    <UserContext.Provider value={{
      menus: [
        { menuID: 2, menuName: 'Item Management', menuParentID: 0, menuType: 1 },
        { menuID: 20, menuName: 'Company', menuParentID: 2, menuURL: 'Company.aspx', menuType: 2 },
        { menuID: 21, menuName: 'Model', menuParentID: 2, menuURL: 'Model.aspx', menuType: 2 },
      ],
    }}
    >
      <HomePage pathname="/item-management/model" onNavigate={jest.fn()} onLogout={jest.fn()} />
    </UserContext.Provider>,
  );

  expect(screen.getByRole('button', { name: 'Item Management' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'Model' })).toBeInTheDocument();
});

test('root URL renders the login page without briefly showing the home page', () => {
  window.history.replaceState({}, '', '/');
  render(<App />);

  expect(window.location.pathname).toBe('/login');
  expect(screen.getByRole('heading', { name: 'Login Form' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Welcome to AzkoPOS' })).not.toBeInTheDocument();
});
