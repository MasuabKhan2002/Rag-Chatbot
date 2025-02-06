import React, { useState, useEffect, useRef } from 'react';
import { getUserInformation } from '../../Firebase/auth';
import { Toast } from 'primereact/toast';
import NavBar from './NavBar';
import Sidebar from './SideBar';
import Chatbot from './Chatbot';

function HomePage() {
  const [messageLog, setMessageLog] = useState([
    { type: 'bot', message: 'Hi there, how can I help?' }
  ]);
  const [userInfo, setUserInfo] = useState({});
  const toast = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userInfo = await getUserInformation();
        setUserInfo(userInfo);
      } catch (error) {
        console.error('Error fetching data:', error);
        showError(error);
      }
    }

    fetchData();
  }, []);

  const showError = (errorMessage) => {
    toast.current.show({severity:'error', summary: 'Error', detail: errorMessage, life: 3000});
  };

  const showSuccess = (message) => {
    toast.current.show({severity:'success', summary: 'Success', detail: message, life: 3000});
  }

  return (
    <>
        <Toast ref={toast} />
        <div className='bg-gray-900' style={{ height: '102vh' }}>
          <div className="grid nested-grid grid-nogutter">
            <div className='col-4'>
              <Sidebar
                userInfo={userInfo}
                setMessageLog={setMessageLog}
                showError={showError}
                showSuccess={showSuccess}
              />
            </div>
            <div className='col'>
              <div className="grid">
                <div className="col-12">
                  <NavBar/>
                </div>
                <div className='col-12'>
                <Chatbot
                  userInfo={userInfo}
                  messageLog={messageLog}
                  setMessageLog={setMessageLog}
                  showSuccess={showSuccess}
                  showError={showError}
                />
                </div>
              </div>
            </div>
          </div>
      </div>
    </>
  );
}

export default HomePage;