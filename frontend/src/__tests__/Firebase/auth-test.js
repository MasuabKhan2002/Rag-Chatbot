import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { when } from 'jest-when';
import '@testing-library/jest-dom/extend-expect';
import { AdminSignInButton, SignInButton, RequireAuth, RequireAdminAuth, getUserInformation, SignOutButton } from '../../Firebase/auth';
import * as firebaseAuth from 'firebase/auth';
import * as navigate from 'react-router-dom';

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn().mockImplementation((auth) => jest.fn()),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn()
}));

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn().mockImplementation((route) => jest.fn()),
    Outlet: jest.fn()
}));

jest.mock('../../Firebase/config');

describe('AdminSignInButton', () => {
  test('renders login button', () => {
    render(<AdminSignInButton/>);
    
    const loginButton = screen.getByText('DCU Staff Login');
    expect(loginButton).toBeInTheDocument();
  });

  test('calls signInPressed function when button is clicked', async () => {
    const mockSetShowLoading = jest.fn();
    const mockShowError = jest.fn();

    const mockNavigate = jest.spyOn(navigate, "useNavigate");

    when(firebaseAuth.signInWithPopup)
    .calledWith(expect.anything(), expect.anything())
    .mockResolvedValue({ user: { uid: 'mockUid' } });

    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({ message: 'True' })
    });

    render(<AdminSignInButton setShowLoading={mockSetShowLoading} showError={mockShowError}/>);
    
    const loginButton = screen.getByText('DCU Staff Login');
    fireEvent.click(loginButton);

    await act(async () => {});

    expect(mockFetch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockSetShowLoading).toHaveBeenCalledWith(true);
  });
});

describe('SignInButton', () => {
    test('renders login button', () => {
        render(<SignInButton/>);
        
        const loginButton = screen.getByText('DCU Student Login');
        expect(loginButton).toBeInTheDocument();
    });

    test('calls signInPressed function when button is clicked', async () => {
        const mockSetShowLoading = jest.fn();
        const mockShowError = jest.fn();

        const mockNavigate = jest.spyOn(navigate, "useNavigate");
    
        when(firebaseAuth.signInWithPopup)
        .calledWith(expect.anything(), expect.anything())
        .mockResolvedValue({ user: { uid: 'mockUid' } });
    
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: () => Promise.resolve({ message: 'True' })
        });
    
        render(<SignInButton setShowLoading={mockSetShowLoading} showError={mockShowError}/>);
        
        const loginButton = screen.getByText('DCU Student Login');
        await act(async () => {
            fireEvent.click(loginButton);
        });
    
        expect(mockFetch).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalled();
        expect(mockSetShowLoading).toHaveBeenCalledWith(true);
      });
});

describe('RequireAuth', () => {
    test('redirects to /login if user is not authenticated', async () => {
        const mockNavigate = jest.fn();
        navigate.useNavigate.mockReturnValue(mockNavigate);

        firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
            callback(null);
        });

        await act(async () => {
            render(<RequireAdminAuth />);
        });
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('redirects to /login if user is not signed in', async () => {
        const mockNavigate = jest.fn();
        navigate.useNavigate.mockReturnValue(mockNavigate);

        firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
            const user = { uid: 'mockUserId' };
            callback(user);
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'False' }),
            })
        );

        await act(async () => {
            render(<RequireAdminAuth />);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    test('renders children if user is signed in', async () => {
        const mockOutlet = jest.spyOn(navigate, 'Outlet');

        const mockNavigate = jest.fn();
        navigate.useNavigate.mockReturnValue(mockNavigate);

        firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
            const user = { uid: 'mockUserId' };
            callback(user);
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'True' }),
            })
        );

        await act(async () => {
            render(<RequireAdminAuth />);
        });

        expect(mockOutlet).toHaveBeenCalled();
    });
});

describe('RequireAdminAuth', () => {
    test('redirects to /login if user is not authenticated', async () => {
        const mockNavigate = jest.fn();
        navigate.useNavigate.mockReturnValue(mockNavigate);

        firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
            callback(null);
        });

        await act(async () => {
            render(<RequireAuth />);
        });
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('redirects to /login if user is not signed in', async () => {
        const mockNavigate = jest.fn();
        navigate.useNavigate.mockReturnValue(mockNavigate);

        firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
            const user = { uid: 'mockUserId' };
            callback(user);
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'False' }),
            })
        );

        await act(async () => {
            render(<RequireAuth />);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('renders children if user is signed in', async () => {
        const mockOutlet = jest.spyOn(navigate, 'Outlet');

        const mockNavigate = jest.fn();
        navigate.useNavigate.mockReturnValue(mockNavigate);

        firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
            const user = { uid: 'mockUserId' };
            callback(user);
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'True' }),
            })
        );

        await act(async () => {
            render(<RequireAuth />);
        });

        expect(mockOutlet).toHaveBeenCalled();
    });
});

describe('getUserInformation', () => {
    test('resolves with user information when user is authenticated', async () => {
        const mockUser = {
            uid: 'mockUid',
            email: 'test@example.com',
            displayName: 'Test User'
        };

        firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
            callback(mockUser);
        });

        const userInfo = await getUserInformation();

        expect(userInfo).toEqual({
            email: mockUser.email,
            name: mockUser.displayName,
            userid: mockUser.uid
        });
    });

    test('rejects with an error when user is not authenticated', async () => {
        firebaseAuth.onAuthStateChanged.mockImplementation((auth, callback) => {
            callback(null);
        });

        await expect(getUserInformation()).rejects.toThrowError('User is not signed in.');
    });
});

describe('SignOutButton', () => {
    test('renders sign out button', () => {
        render(<SignOutButton/>);
        
        const loginButton = screen.getByText('Log out');
        expect(loginButton).toBeInTheDocument();
    });

    test('calls signOut and navigates to /login on button click', async () => {
        jest.useFakeTimers()
        const mockNavigate = jest.fn();
        navigate.useNavigate.mockReturnValue(mockNavigate);
        const mockSignOut = jest.fn()

        when(firebaseAuth.signOut)
            .calledWith(expect.anything())
            .mockResolvedValue(mockSignOut);

        render(<SignOutButton />);

        const logoutButton = screen.getByText('Log out');
        fireEvent.click(logoutButton);

        await act(async () => {
            jest.advanceTimersByTime(2000);
        });

        expect(logoutButton).not.toHaveAttribute('loading');

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});