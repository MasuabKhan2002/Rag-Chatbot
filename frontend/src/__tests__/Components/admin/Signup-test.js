import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AdminSignUp from '../../../Components/admin/Signup';

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn()
}));

describe('FirstTimeSignInPage', () => {
    test('renders the component', async () => {
      render(<AdminSignUp />);
      
      expect(screen.getByText('Admin Sign Up')).toBeInTheDocument();
    });
    
    test('handles input change', async () => {
        render(<AdminSignUp />);
        
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        
        expect(screen.getByPlaceholderText('Email')).toHaveValue('test@example.com');
    });

    test('handles dropdown selection', async () => {
        render(<AdminSignUp />);
        
        fireEvent.change(screen.getByLabelText('course-dropdown'), { target: { value: 'CASE4' } });
        
        expect(screen.getByLabelText('course-dropdown')).toHaveValue('CASE4');
    });
});