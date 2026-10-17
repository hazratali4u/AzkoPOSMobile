import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('login opens the dashboard and page navigation keeps the shared shell', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(screen.getByRole('heading', { name: 'Welcome to AzkoPOS' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Transactions/ }));
  fireEvent.click(screen.getByRole('button', { name: 'POS' }));

  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: 'POS' })).toBeInTheDocument();
  expect(screen.getByText('AzkoPOS')).toBeInTheDocument();
});
