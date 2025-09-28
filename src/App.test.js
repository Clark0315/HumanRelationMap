import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Human Relation Map app', () => {
  render(<App />);
  const saveButton = screen.getByText(/儲存 JSON/i);
  expect(saveButton).toBeInTheDocument();

  const addPersonButton = screen.getByText(/新增人員/i);
  expect(addPersonButton).toBeInTheDocument();
});
