import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import Sidebar, { Chats, Notification, QuickLinks } from '../../../Components/homepage/SideBar';

global.fetch = jest.fn().mockResolvedValue({ 
    ok: true,
    json: () => Promise.resolve({ conversations: [] }) 
});
  
describe('Sidebar', () => {
  test('renders Sidebar component without crashing', () => {
    const mockUserInfo = jest.fn();
    const mockShowError = jest.fn();
    const mockSetMessageLog = jest.fn();
    const mockShowSuccess = jest.fn();

    render(<Sidebar 
        userInfo={mockUserInfo} 
        setMessageLog={mockSetMessageLog} 
        showError={mockShowError} 
        showSuccess={mockShowSuccess} />);

    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Conversations')).toBeInTheDocument();
  });
});

describe('Chats', () => {
    test('renders Chats component without crashing', async () => {
        const userInfo = { userid: '123' };
        const setMessageLog = jest.fn();
        const showError = jest.fn();
        const showSuccess = jest.fn();
    
        render(
          <Chats 
            userInfo={userInfo} 
            setMessageLog={setMessageLog} 
            showError={showError} 
            showSuccess={showSuccess} 
          />
        );

        await waitFor(() => expect(fetch).toHaveBeenCalled());

        const conversationElement = screen.getByText('No previous conversations');
        expect(conversationElement).toBeInTheDocument();

    });

    test('fetches conversations successfully', async () => {
        const userInfo = { userid: '123' };
        const setMessageLog = jest.fn();
        const showError = jest.fn();
        const showSuccess = jest.fn();
      
        const mockConversations = [
          { _id: '1', name: 'Conversation 1' },
          { _id: '2', name: 'Conversation 2' }
        ];
        fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ conversations: mockConversations }) });
      
        await act(async () => {
            render(
            <Chats 
                userInfo={userInfo} 
                setMessageLog={setMessageLog} 
                showError={showError} 
                showSuccess={showSuccess} 
            />
            );
        });
        await waitFor(() => expect(fetch).toHaveBeenCalled());

        const conversation1Element = screen.getByText('Conversation 1');
        const conversation2Element = screen.getByText('Conversation 2');
        expect(conversation1Element).toBeInTheDocument();
        expect(conversation2Element).toBeInTheDocument();
    });
});

describe('Notifications', () => {
    test('fetches notifications successfully', async () => {
        const userInfo = { userid: '123' };
        const showError = jest.fn();
        const showSuccess = jest.fn();
      
        const mockNotifications = [
          { course: 'Math', files: ['file1.pdf', 'file2.doc'] },
          { course: 'Science', files: ['file3.jpg', 'file4.png'] }
        ];
        fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ notifications: mockNotifications }) });
      
        await act(async () => {
            render(
            <Notification 
                userInfo={userInfo} 
                showError={showError} 
                showSuccess={showSuccess} 
            />
            );
        });
      
        await waitFor(() => expect(fetch).toHaveBeenCalled());
      
        const mathNotification = screen.getByText('Math');
        const scienceNotification = screen.getByText('Science');
        expect(mathNotification).toBeInTheDocument();
        expect(scienceNotification).toBeInTheDocument();
    });

    test('searches notifications by date', async () => {
        const userInfo = { userid: '123' };
        const showError = jest.fn();
        const showSuccess = jest.fn();
      
        const mockNotifications = [
          { course: 'English', files: ['file1.pdf', 'file2.doc'] },
          { course: 'History', files: ['file3.jpg', 'file4.png'] }
        ];
        fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ notifications: mockNotifications }) });
      
        await act(async () => {
            render(
            <Notification 
                userInfo={userInfo} 
                showError={showError} 
                showSuccess={showSuccess} 
            />
            );
        });
      
        await waitFor(() => expect(fetch).toHaveBeenCalled());
      
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);
      
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
      
        const englishNotification = screen.getByText('English');
        const historyNotification = screen.getByText('History');
        expect(englishNotification).toBeInTheDocument();
        expect(historyNotification).toBeInTheDocument();
    });
});

describe('Quicklinks', () => {
    test('renders QuickLinks component', () => {
        render(<QuickLinks />);
        
        const quickLinksText = screen.getByText('Quick Links');
        expect(quickLinksText).toBeInTheDocument();
      
        const emailLink = screen.getByText('Email');
        const myDetailsLink = screen.getByText('My Details');
        const timetableLink = screen.getByText('Timetable');
        const pastPapersLink = screen.getByText('Past Papers');
        const libraryLink = screen.getByText('Library');
        const clubsAndSocsLink = screen.getByText('Clubs & Socs');
        const studentUnionLink = screen.getByText('Student Union');
        const academicCalendarLink = screen.getByText('Academic Calender');
      
        expect(emailLink).toBeInTheDocument();
        expect(myDetailsLink).toBeInTheDocument();
        expect(timetableLink).toBeInTheDocument();
        expect(pastPapersLink).toBeInTheDocument();
        expect(libraryLink).toBeInTheDocument();
        expect(clubsAndSocsLink).toBeInTheDocument();
        expect(studentUnionLink).toBeInTheDocument();
        expect(academicCalendarLink).toBeInTheDocument();
      });
});