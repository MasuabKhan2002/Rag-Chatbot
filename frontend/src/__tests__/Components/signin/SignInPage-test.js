import React from 'react';
import { render, screen, act } from '@testing-library/react';
import SignInPage from '../../../Components/signin/SignInPage';

jest.mock('../../../Firebase/storage', () => ({
    getImageFromStorage: () => "https://example.com/logo.png",
}));

jest.mock('../../../Firebase/auth', () => {
    const React = require('react');
    return {
        SignInButton: () => <button>Mock Sign In Button</button>,
        AdminSignInButton: () => <button>Mock Admin Sign In Button</button>,
    };
});

describe('SignInPage', () => {
    test('renders sign-in page with background image and buttons', async () => {
        await act(async () => {
            render(<SignInPage />);
        });
        
        const backgroundImageElement = screen.getByAltText('Logo');
        expect(backgroundImageElement).toBeInTheDocument();
        
        const signInButtonElement = screen.getByText('Mock Sign In Button');
        expect(signInButtonElement).toBeInTheDocument();
        
        const adminSignInButtonElement = screen.getByText('Mock Admin Sign In Button');
        expect(adminSignInButtonElement).toBeInTheDocument();        
    });
});