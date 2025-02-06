import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';

function Sidebar({userInfo,setMessageLog, showError, showSuccess}) {
    return (
        <div className='bg-gray-800 h-screen flex flex-column'>
            <QuickLinks/>
            <Notification userInfo={userInfo} showError={showError} showSuccess={showSuccess}/>
            <Chats userInfo={userInfo} setMessageLog={setMessageLog} showError={showError} showSuccess={showSuccess}/>
        </div>
    );
}

function Chats({userInfo, setMessageLog, showError, showSuccess}) {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                if (!userInfo.userid) {
                    return;
                }
                const response = await fetch('http://127.0.0.1:5000/get_conversations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userid: userInfo.userid })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch conversations');
                }

                const data = await response.json();
                setConversations(data.conversations);
            } catch (error) {
                showError("Error fetching Conversations");
            }
        }

        fetchData();
    }, [userInfo.userid]);

    const handleDelete = async (conversationId) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/delete_conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userid: userInfo.userid, document: conversationId })
            });

            if (!response.ok) {
                throw new Error('Failed to delete conversation');
            }

            setConversations(prevConversations => prevConversations.filter(conversation => conversation._id !== conversationId));
            
            showSuccess("Conversation deleted successfully");
        } catch (error) {
            showError("Error deleting conversation");
        }
    };

    const handleConversationClick = async (conversationId) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/load_conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userid: userInfo.userid, document: conversationId })
            });

            if (!response.ok) {
                throw new Error('Failed to load conversation');
            }

            const data = await response.json();
            setMessageLog(data.conversation)
            
            showSuccess("Loaded conversation")
        } catch (error) {
            console.log(error);
            showError("Error loading conversation");
        }
    };

    return (
        <>
            <p className='text-2xl px-3 pt-2 font-medium text-gray-200'>Conversations</p>
            <div className='bg-gray-800 h-24rem m-2 border-round overflow-auto'>
                {conversations.length === 0 ? (
                    <p className=" p-3 w-full h-full flex align-items-center justify-content-center">No previous conversations</p>
                ) : (
                    conversations.slice().reverse().map(conversation => (
                        <div key={conversation._id} className='flex'>
                            <div onClick={() => handleConversationClick(conversation._id)} className="flex justify-content-between p-button my-2 ml-2 p-3 mr-1 w-full">
                                <p className='flex align-items-center font-medium text-gray-900  text-lg'>{conversation.name}</p>
                            </div>
                            <Button icon="pi pi-trash" onClick={() => handleDelete(conversation._id)} className="my-2 mr-2 text-gray-200" severity='secondary'/>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

function Notification({userInfo, showError, showSuccess}) {
    const [notifications, setNotifications] = useState([]);
    const [date, setDate] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                if (!userInfo.userid) {
                    return;
                }

                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;

                const response = await fetch('http://127.0.0.1:5000/get_notifications', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userid: userInfo.userid, time: formattedDate})
                });

                if (!response.ok) {
                    throw new Error('Failed to get notifications');
                }

                const data = await response.json();
                setNotifications(data.notifications);
            } catch (error) {
                showError("Error getting notifications");
            }
        }

        fetchData();
    }, [userInfo.userid]);

    const handleSearch = async () => {
        try {
            let searchDate = date;

            if (!searchDate) {
                searchDate = new Date();
            }

            const year = searchDate.getFullYear();
            const month = String(searchDate.getMonth() + 1).padStart(2, '0');
            const day = String(searchDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            const response = await fetch('http://127.0.0.1:5000/get_notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userid: userInfo.userid, time: formattedDate })
            });

            if (!response.ok) {
                throw new Error('Failed to search date');
            }

            const data = await response.json();
            setNotifications(data.notifications);
            
            showSuccess("Notifications searched");
        } catch (error) {
            showError("Error searching Notifications");
        }
    }; 

    const handleNotificationClick = (notification) => {
        if (!selectedNotification) {
            setSelectedNotification(notification);
        }
        else if (selectedNotification != notification) {
            setSelectedNotification(notification);
        }
        else {
            setSelectedNotification(null);
        }
    };

    return (
        <>
            <p className='text-2xl px-3 pt-2 font-medium text-gray-200'>Notifications</p>
            <div className='flex pt-2 px-2'>
                <Calendar value={date} onChange={(e) => setDate(e.value)} dateFormat="yy-mm-dd" className='w-full' placeholder='Search Notifications' />
                <Button label='Search' onClick={handleSearch} className="pl-1 text-gray-200 ml-1" severity='secondary'/>
            </div>
            <div className='bg-gray-800 h-18rem mx-2 border-round overflow-auto'>
                {notifications.length === 0 ? (
                    <p className=" p-3 w-full h-full flex align-items-center justify-content-center">No new notifications</p>
                ) : (
                    notifications.map(notification => (
                        <div key={notification.course}>
                            <div className='flex' onClick={() => handleNotificationClick(notification)}>
                                <div className={`flex justify-content-between p-button p-button-primary mx-2 p-3 w-full text-gray-900 ${
                                        selectedNotification && selectedNotification.name === notification.name ? 'mt-2 border-round-top' : 'my-2 border-round'
                                }`} onClick={() => handleNotificationClick(notification)}>
                                    <p className='flex align-items-center font-medium  text-lg'>{notification.course}</p>
                                    <div className='pi pi-chevron-down flex align-items-center' />
                                </div>
                            </div>
                            {selectedNotification && selectedNotification.course === notification.course && (
                                <div className="mx-2 bg-gray-700 border-round-bottom p-1 pl-4">
                                    {selectedNotification.files.map(file => (
                                        <p key={file} className="flex align-items-center font-medium text-gray-200 text-md">{file}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );    
}

function QuickLinks() {
    return (
        <>
            <p className='text-2xl px-3 pt-4 font-medium text-gray-200'>Quick Links</p>
            <div className="flex flex-wrap gap-2 p-1 pl-2 pt-2">
                <div className='flex flex-column gap-2'>
                    <a href="http://bit.ly/dcustudentmail" className="p-button p-button-secondary text-gray-200">Email</a>
                    <a href="http://bit.ly/1TD0o6b" className="p-button p-button-secondary text-gray-200">My Details</a>
                    <a href="https://mytimetable.dcu.ie/" className="p-button p-button-secondary text-gray-200">Timetable</a>
                </div>
                <div className='flex flex-column gap-2'>
                    <a href="https://bit.ly/3ntgVdv" className="p-button p-button-secondary text-gray-200">Past Papers</a>
                    <a href="http://bit.ly/1Jy3zBT" className="p-button p-button-secondary text-gray-200">Library</a>
                    <a href="https://dcuclubsandsocs.ie/" className="p-button p-button-secondary text-gray-200">Clubs & Socs</a>
                </div>
                <div className='flex flex-column gap-2'>
                    <a href="http://bit.ly/1IIXu3U" className="p-button p-button-secondary text-gray-200">Student Union</a>
                    <a href="https://www.dcu.ie/registry/academic-calendar-202324" className="p-button p-button-secondary text-gray-200">Academic Calender</a>
                </div>
            </div>
        </>
    );
}

export default Sidebar; 
export {QuickLinks, Notification, Chats};