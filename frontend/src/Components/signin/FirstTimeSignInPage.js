import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { getImageFromStorage } from '../../Firebase/storage';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { ListBox } from 'primereact/listbox';
import { InputNumber } from 'primereact/inputnumber';
import { getUserInformation } from '../../Firebase/auth';
import { useNavigate } from "react-router-dom";
import LoadingScreen from './LoadingScreen';

function FirstTimeSignInPage() {
  const navigate = useNavigate();
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [inputIndex, setInputIndex] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [formData, setFormData] = useState({
    userid: '',
    course: '',
    name: '',
    studentid: null,
    email: '',
    campus: []
  });
  const courses = [
    'CASE4',
    'CASE3',
    'CASE2',
    'CASE1'
  ];
  const campuses = [
    'Glasnevin',
    'St.Patricks'
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

  const handleNumberChange = (e, name) => {
    const value  = e.value;
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

  const handleCampusChange = (e) => {
    const selectedCampuses = e.value;
    setFormData(prevData => ({
      ...prevData,
      campus: selectedCampuses
    }));
  };

  const handleNext = () => {
    setInputIndex(prevIndex => prevIndex + 1);
  };

  const handleBack = () => {
    setInputIndex(prevIndex => prevIndex - 1);
  }

  const handleSubmit = () => {
    if (!formData.course || !formData.name || !formData.studentid || !formData.email || !formData.campus.length) {
      showError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address.');
      return;
    }

    if (formData.studentid.toString().length !== 8) {
      showError('Student ID must be 8 digits long.');
      return;
    }

    setShowLoading(true);

    const jsonFormData = JSON.stringify(formData);

    fetch('http://127.0.0.1:5000/first_time_sign_in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonFormData
    })
    .then(response => {
      if (!response.ok) {
          throw new Error('Failed to sign up. Please try again.'); // throw error for non-200 status codes
      }
      return response.json();
    })
    .then(data => {
      setTimeout(() => {
        navigate('/home');
        setShowLoading(false);
      }, 3000);
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Log in failed, try again');
        setShowLoading(false);
    });
  };

  const renderForm = () => {
    const inputs = [
      {label: 'Personal Information', emailLabel: 'Email', emailName: 'email', nameLabel: 'Full Name', nameName: 'name'},
      {label: 'Course Information', courseLabel: 'Course', courseName: 'course', studentIdLabel: 'Student ID', studentIdName: 'studentid'},
      {label: 'Campus Information', name: 'campus'}
    ];

    if (inputIndex < inputs.length) {
      const input = inputs[inputIndex];
      if (input.label === 'Personal Information') {
        return (
          <>
            <div className='flex justify-content-center pt-2'>
              <div className='text-4xl font-medium'>{input.label}</div>
            </div>
            <div className='text-2xl font-medium pl-4'>{input.emailLabel}:</div>
            <InputText type="text" placeholder={input.emailLabel} onChange={(e) => handleInputChange(e, input.emailName)} className="mx-6 my-2" value={formData[input.emailName]}/>
            <div className='text-2xl font-medium pl-4 pt-6'>{input.nameLabel}:</div>
            <InputText type="text" placeholder={input.nameLabel} className="mx-6 my-2" onChange={(e) => handleInputChange(e, input.nameName)} value={formData[input.nameName]}/>
            <div className='flex justify-content-between flex-wrap p-4'>
              <Button label="Back" icon="pi pi-angle-double-left" disabled />
              <Button label="Next" icon="pi pi-angle-double-right" iconPos="right" onClick={handleNext}/>
            </div>
          </>
        );
      } else if (input.label === 'Course Information') {
        return (
          <>
            <div className='flex justify-content-center pt-2'>
              <div className='text-4xl font-medium'>{input.label}</div>
            </div>
            <div className='text-2xl font-medium pl-4'>{input.courseLabel}:</div>
            <Dropdown aria-label='course-dropdown' value={formData[input.courseName]} options={courses} placeholder="Select Your Course" 
             className="mx-6 my-2" onChange={(e) => handleDropdownChange(e, input.courseName)}/>
            <div className='text-2xl font-medium pl-4 pt-6'>{input.studentIdLabel}:</div>
            <InputNumber aria-label="input number" useGrouping={false} className="mx-6 my-2" value={formData[input.studentIdName]} onChange={(e) => handleNumberChange(e, input.studentIdName)}/>
            <div className='flex justify-content-between flex-wrap p-4'>
              <Button label="Back" icon="pi pi-angle-double-left" onClick={handleBack} />
              <Button label="Next" icon="pi pi-angle-double-right" iconPos="right" onClick={handleNext}/>
            </div>
          </>
        )
      } else {
        return (
          <>
            <div className='flex justify-content-center pt-2'>
              <div className='text-4xl font-medium'>{input.label}</div>
            </div>
            <div className='text-2xl font-medium pl-4 pt-6'>Select your campus(s):</div>
            <ListBox multiple value={formData.campus} options={campuses} className="mx-6 my-4" onChange={handleCampusChange}/>
            <div className='flex justify-content-between flex-wrap p-4 pt-8'>
              <Button label="Back" icon="pi pi-angle-double-left" onClick={handleBack}/>
              <Button label="Submit" icon="pi pi-check" iconPos="right" onClick={handleSubmit}/>
            </div>
          </>
        )
      }
    }
  }

  return (
    <>
      <Toast ref={toast} />
      {showLoading && <LoadingScreen />}
      <div className="bg-cover h-screen" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
          <div className="flex justify-content-center flex-wrap align-items-center justify-content-center align-content-center h-screen w-screen fixed">
              <div className='flex flex-column bg-white border-round w-6 h-25rem'>
                {renderForm()}
              </div>
          </div>
      </div>
    </>
  );
  
}

export default FirstTimeSignInPage;