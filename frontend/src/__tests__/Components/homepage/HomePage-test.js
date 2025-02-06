import React from 'react';
import { render, screen, act } from '@testing-library/react';
import HomePage from '../../../Components/homepage/HomePage';
import { getUserInformation } from '../../../Firebase/auth';

jest.mock('../../../Firebase/auth', () => ({
  getUserInformation: jest.fn()
}));

jest.mock('../../../Components/homepage/NavBar', () => {
    return () => <div data-testid="mocked-navbar">Mocked NavBar</div>;
});
  
jest.mock('../../../Components/homepage/SideBar', () => {
    return () => <div data-testid="mocked-sidebar">Mocked Sidebar</div>;
});
  
jest.mock('../../../Components/homepage/Chatbot', () => {
    return () => <div data-testid="mocked-chatbot">Mocked Chatbot</div>;
});

jest.mock('primereact/toast', () => ({
    Toast: () => <div>Toast</div>
}));


describe('HomePage', () => {
  test('renders home page with user information', async () => {
    const mockedUserInfo = { name: 'John Doe', email: 'john@example.com', uid: "1234"};

    getUserInformation.mockResolvedValue(mockedUserInfo);

    await act(async () => {
        render(<HomePage />);
    });


    expect(screen.getByText('Toast')).toBeInTheDocument();

    expect(screen.getByTestId('mocked-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mocked-chatbot')).toBeInTheDocument();

    expect(getUserInformation).toHaveBeenCalled();

  });
});