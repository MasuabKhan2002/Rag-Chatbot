import React, { useState, useEffect, useRef } from 'react';
import { getImageFromStorage } from '../../Firebase/storage';
import { SignInButton, AdminSignInButton } from '../../Firebase/auth';
import { Toast } from 'primereact/toast';
import LoadingScreen from './LoadingScreen';

function SignInPage() {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const toast = useRef(null);
  const [showLoading, setShowLoading] = useState(false);

  const showError = (errorMessage) => {
    toast.current.show({severity:'error', summary: 'Error', detail: errorMessage, life: 3000});
  };

  useEffect(() => {
    async function fetchImage() {
      const backgroundImagePath = 'gs://dcu-loop-chatbot.appspot.com/Sign-in-background.jpg';
      const url = await getImageFromStorage(backgroundImagePath);
      setBackgroundImageUrl(url);
      const logoPath = 'gs://dcu-loop-chatbot.appspot.com/Loop-Logo.png';
      const logoUrl = await getImageFromStorage(logoPath);
      setLogoImageUrl(logoUrl);

      document.title = 'Log in to Chatbot | DCU Loop';
    }

    fetchImage();
  }, []);

  return (
    <>
      <Toast ref={toast} />
      {showLoading && <LoadingScreen />}
      <div className="bg-cover h-screen" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
          <div className="flex justify-content-center flex-wrap align-items-center justify-content-center align-content-center h-screen w-screen fixed">
              <div className='flex flex-column bg-white border-round w-20rem h-21rem'>
                  <div className="flex justify-content-center p-7 py-6">
                      {logoImageUrl && <img src={logoImageUrl} alt="Logo" className="w-12rem h-6rem" />}
                  </div>
                  <div className='flex justify-content-center'>
                      <SignInButton showError={showError} setShowLoading={setShowLoading}/>                        
                  </div>
                  <div className='flex justify-content-center p-2'>
                      <AdminSignInButton showError={showError} setShowLoading={setShowLoading}/>                        
                  </div>
              </div>
          </div>
      </div>
    </>
  );
}

export default SignInPage;