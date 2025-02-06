import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FirstTimeSignInPage from '../../../Components/signin/FirstTimeSignInPage';
import * as navigate from 'react-router-dom';

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn()
}));

describe('FirstTimeSignInPage', () => {
    test('renders the component', async () => {
      render(<FirstTimeSignInPage />);
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    test('renders the form for personal information', async () => {
        render(<FirstTimeSignInPage />);
        
        expect(screen.getByText('Personal Information')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    });
    
    test('handles input change', async () => {
        render(<FirstTimeSignInPage />);
        
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        
        expect(screen.getByPlaceholderText('Email')).toHaveValue('test@example.com');
    });

    test('handles dropdown selection', async () => {
        render(<FirstTimeSignInPage />);
        
        fireEvent.click(screen.getByText('Next'));
        fireEvent.change(screen.getByLabelText('course-dropdown'), { target: { value: 'CASE4' } });
        
        expect(screen.getByLabelText('course-dropdown')).toHaveValue('CASE4');
    });
    
    test('handles number input change', async () => {
        render(<FirstTimeSignInPage />);
        
        fireEvent.click(screen.getByText('Next'));
        fireEvent.change(screen.getByLabelText('input number'), { target: { value: '12345678' } });
        
        expect(screen.getByLabelText('input number')).toHaveValue("12345678");
    });
});