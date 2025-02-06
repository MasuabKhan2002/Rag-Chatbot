import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Navbar from '../../../Components/homepage/NavBar';

jest.mock('../../../Firebase/storage', () => ({
  getImageFromStorage: () => "https://example.com/logo.png"
}));

jest.mock('../../../Firebase/auth', () => ({
  SignOutButton: () => <button>Sign Out</button>
}));

describe('Navbar', () => {
  test('renders logo image and sign out button', async () => {
    await act(async () => {
      render(<Navbar />);
    });

    const logoImage = screen.getByAltText('Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'https://example.com/logo.png');

    const signOutButton = screen.getByText('Sign Out');
    expect(signOutButton).toBeInTheDocument();
  });
});