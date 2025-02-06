import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { getImageFromStorage } from '../../Firebase/storage';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { getUserInformation } from '../../Firebase/auth';
import { useNavigate } from "react-router-dom";
import LoadingScreen from '../signin/LoadingScreen';
import { Password } from 'primereact/password';

function AdminSignUp() {
  const navigate = useNavigate();
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [formData, setFormData] = useState({
    userid: '',
    course: '',
    name: '',
    email: '',
    passkey: ''
  });
  const courses = [
    'CASE4',
    'CASE3',
    'CASE2',
    'CASE1'
  ];
  const toast = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const backgroundImagePath = 'gs://dcu-loop-chatbot.appspot.com/Sign-in-background.jpg';
        const url = await getImageFromStorage(backgroundImagePath);
        setBackgroundImageUrl(url);
        document.title = 'First time log in | DCU Loop';

        const userInfo = await getUserInformation();
        setFormData(prevData => ({
          ...prevData,
          ...userInfo
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);


  const showError = (errorMessage) => {
    toast.current.show({severity:'error', summary: 'Error', detail: errorMessage, life: 3000});
  };

  const handleInputChange = (e, name) => {
    const {value}  = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDropdownChange = (e, name) => {
    const { value } = e;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.course || !formData.name || !formData.email ) {
      showError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address.');
      return;
    }

    setShowLoading(true);

    const jsonFormData = JSON.stringify(formData);

    fetch('http://127.0.0.1:5000/admin/first_time_sign_in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonFormData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to sign up. Please try again.');
        }
        return response.json();
    })
    .then(data => {
        setTimeout(() => {
            navigate('/admin/home');
            setShowLoading(false);
        }, 2000);
    })
    .catch(error => {
        console.error('Error:', error);
        showError(error.message);
        setShowLoading(false);
    })
    };

    const inputs = {
        label: 'Admin Sign Up', 
        emailLabel: 'Email', emailName: 'email', 
        nameLabel: 'Full Name', nameName: 'name',
        courseLabel: 'Course', courseName: 'course',
        passwordLabel: 'Password', passwordName: 'passkey'
    };

    return (
        <>
            <Toast ref={toast} />
            {showLoading && <LoadingScreen />}
            <div className="bg-cover h-screen" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
                <div className="flex justify-content-center flex-wrap align-items-center justify-content-center align-content-center h-screen w-screen fixed">
                    <div className='flex flex-column bg-white border-round w-6'>
                        <div className='flex justify-content-center pt-2'>
                            <div className='text-4xl font-medium'>{inputs.label}</div>
                        </div>
                        <div className='text-2xl font-medium pl-4'>{inputs.emailLabel}:</div>
                        <InputText type="text" placeholder={inputs.emailLabel} onChange={(e) => handleInputChange(e, inputs.emailName)} className="mx-6 my-2" value={formData[inputs.emailName]}/>
                        <div className='text-2xl font-medium pl-4 pt-2'>{inputs.nameLabel}:</div>
                        <InputText type="text" placeholder={inputs.nameLabel} className="mx-6 my-2" onChange={(e) => handleInputChange(e, inputs.nameName)} value={formData[inputs.nameName]}/>
                        <div className='text-2xl font-medium pl-4'>{inputs.courseLabel}:</div>
                        <Dropdown aria-label='course-dropdown' value={formData[inputs.courseName]} options={courses} placeholder="Select Your Course" 
                            className="mx-6 my-2" onChange={(e) => handleDropdownChange(e, inputs.courseName)}/>
                        <div className='text-2xl font-medium pl-4'>{inputs.passwordLabel}:</div>
                        <Password 
                            aria-label='password-input' 
                            placeholder={inputs.passwordLabel}
                            onChange={(e) => handleInputChange(e, inputs.passwordName)}
                            className="mx-6 my-2"
                            value={formData[inputs.passwordName]}
                            feedback={false}
                            tabIndex={1}/>
                        <div className='flex flex-row-reverse flex-wrap p-4'>
                            <Button label="Submit" icon="pi pi-check" iconPos="right" onClick={handleSubmit}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminSignUp;