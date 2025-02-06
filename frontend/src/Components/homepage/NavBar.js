import React, { useState, useEffect, useRef } from 'react';
import { getImageFromStorage } from '../../Firebase/storage';
import { SignOutButton } from '../../Firebase/auth';

function Navbar() {
  const [logoImageUrl, setLogoImageUrl] = useState('');

  useEffect(() => {
    async function fetchImage() {
      const logoPath = 'gs://dcu-loop-chatbot.appspot.com/output-onlinepngtools (5).png';
      const logoUrl = await getImageFromStorage(logoPath);
      setLogoImageUrl(logoUrl);

      document.title = 'Home | DCU LoopChatBot';
    }

    fetchImage();
  }, []);

  return (
    <>
      <div className="bg-gray-800 flex">
        <div className='pt-1 pl-3'>
          <img src={logoImageUrl} alt="Logo" className="h-4rem"/>
        </div>
        <div className="navbar-end">
            <SignOutButton/>
        </div>
      </div>
    </>
  );
}

export default Navbar;