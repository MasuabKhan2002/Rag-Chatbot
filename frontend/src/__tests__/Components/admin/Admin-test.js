import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Admin from '../../../Components/admin/Admin';

jest.mock('../../../Components/admin/UploadForm', () => {
    return () => <div data-testid="mocked-upload-form">Upload Form</div>;
});

jest.mock('../../../Components/admin/DeleteForm', () => {
    return () => <div data-testid="mocked-delete-form">Delete Form</div>;
});

jest.mock('primereact/toast', () => ({
    Toast: () => <div>Toast</div>
}));

jest.mock('../../../Firebase/auth', () => ({
    SignOutButton: () => <div>Sign Out Button</div>
}));

describe('Admin Homepage', () => {
    test('renders admin homepage', async () => {
        await act(async () => {
            render(<Admin />);
        });

        expect(screen.getByText('Sign Out Button')).toBeInTheDocument();

        expect(screen.getByText('Toast')).toBeInTheDocument();
        expect(screen.getByLabelText('Delete Data')).toBeInTheDocument();
        expect(screen.getByLabelText('Upload Data')).toBeInTheDocument();
    });

    test('renders upload form', async () => {
        await act(async () => {
            render(<Admin />);
        });

        const uploadButton = screen.getByLabelText('Upload Data');
        await act(async () => {
            fireEvent.click(uploadButton);
        });

        expect(screen.getByTestId('mocked-upload-form')).toBeInTheDocument();
    });

    test('renders delete form', async () => {
        await act(async () => {
            render(<Admin />);
        });

        const deleteButton = screen.getByLabelText('Delete Data');
        await act(async () => {
            fireEvent.click(deleteButton);
        });

        expect(screen.getByTestId('mocked-delete-form')).toBeInTheDocument();
    });
});