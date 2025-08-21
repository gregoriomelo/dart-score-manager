import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dart score manager', () => {
  render(<App />);
  const titleElement = screen.getByText(/dart score/i);
  expect(titleElement).toBeInTheDocument();
});
