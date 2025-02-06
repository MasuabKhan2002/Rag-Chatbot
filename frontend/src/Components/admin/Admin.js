import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import UploadForm from './UploadForm';
import DeleteForm from './DeleteForm';
import { getImageFromStorage } from '../../Firebase/storage';
import { SignOutButton } from '../../Firebase/auth';

function Admin() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const toast = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const backgroundImagePath = 'gs://dcu-loop-chatbot.appspot.com/Sign-in-background.jpg';
        const url = await getImageFromStorage(backgroundImagePath);
        setBackgroundImageUrl(url);
        document.title = 'Admin Homepage | DCU LoopChatbot';

      } catch (error) {
        showError("Background image failed")
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);

  const showError = (errorMessage) => {
    toast.current.show({severity:'error', summary: 'Error', detail: errorMessage, life: 3000});
  };

  const showSuccess = (message) => {
    toast.current.show({severity:'success', summary: 'Succes', detail: message, life: 3000});
  };


  const handleUploadClick = () => {
    setShowUploadForm(true);
    setShowDeleteForm(false);
  };

  const handleDeleteClick = () => {
      setShowUploadForm(false);
      setShowDeleteForm(true);
  };

  const handleBack = () => {
    setShowUploadForm(false);
    setShowDeleteForm(false);
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="bg-cover h-screen" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
        <div className="flex justify-content-center flex-wrap align-items-center justify-content-center align-content-center h-screen w-screen fixed">
          <div className='flex flex-column bg-gray-800 border-round w-5 h-25rem p-2 m-4'>
            {!showUploadForm && (
                <Button
                  label="Upload Data"
                  className="p-button p-button-success w-full h-full"
                  icon="pi pi-upload"
                  iconPos="right"
                  onClick={handleUploadClick}
                />
            )}
            {showUploadForm && (
            <>
              <div className='flex justify-content-center pt-2'>
                <div className='text-4xl text-gray-100 font-medium'>Upload File</div>
              </div>
              <UploadForm showError={showError} showSuccess={showSuccess} handleBack={handleBack}/>
            </>
            )}
          </div>
          <SignOutButton/>
          <div className='flex flex-column bg-gray-800 border-round w-5 h-25rem p-2 m-4'>
          {!showDeleteForm && (
            <Button
              label="Delete Data"
              className="p-button p-button-danger w-full h-full"
              icon="pi pi-trash"
              iconPos="right"
              onClick={handleDeleteClick}
            />
          )}
          {showDeleteForm && (
            <>
              <div className='flex justify-content-center pt-2'>
                <div className='text-4xl text-gray-100 font-medium'>Delete File</div>
              </div>
              <DeleteForm showError={showError} showSuccess={showSuccess} handleBack={handleBack}/>
            </>
          )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
