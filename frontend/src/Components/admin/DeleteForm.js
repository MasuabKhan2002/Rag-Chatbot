import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { getUserInformation } from '../../Firebase/auth';
import { ScrollPanel } from 'primereact/scrollpanel';
import LoadingScreen from '../signin/LoadingScreen';

const DeleteForm = ({showError, showSuccess, handleBack}) => {
  const [selectedFileNames, setSelectedFileNames] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [selectedCourse, setSelectedCourse] = useState('');
  const [groupedFiles, setGroupedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [showFileBox, setShowFileBox] = useState(false);
  const courses = [
    { label: 'CASE4', value: 'CASE4' },
    { label: 'CASE3', value: 'CASE3' },
    { label: 'CASE2', value: 'CASE2' },
    { label: 'CASE1', value: 'CASE1' }
  ];
  const toast = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userInfo = await getUserInformation();
        setUserInfo(userInfo);
      } catch (error) {
        showError('error', 'Error fetching user information');
      }
    }
    fetchData();
  }, []);

  const fetchGroupedFiles = async (courseId) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/admin/get_unique_files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userid: userInfo.userid, course: courseId })
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        showError('Failed to fetch grouped files');
        return [];
      }
    } catch (error) {
      showError('Error fetching grouped files');
      return [];
    }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedFileNames([]);
    setShowFileBox(false);
    if (courseId) {
      const groupedFiles = await fetchGroupedFiles(courseId);
      setGroupedFiles(groupedFiles);
    }
  };

  const handleFileSelection = (fileName) => {
    setSelectedFileNames(fileName);
    setShowFileBox(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFileNames.length === 0) {
      showError('No files selected');
      return;
    }
    setIsLoading(true);

    try {
      for (const fileName of selectedFileNames) {
        const requestData = {
          db: selectedCourse,
          collection: `${selectedCourse}_index`,
          index: 'course_index',
          doc: fileName
        };

        const response = await fetch('http://127.0.0.1:5000/delete_node', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        if (response.ok) {
          const responseData = await response.json();
          showSuccess(responseData.message)
          
          const updatedGroupedFiles = groupedFiles.map(group => ({
            ...group,
            files: group.files.filter(file => file.value !== fileName)
          }));
          setGroupedFiles(updatedGroupedFiles);
        } else {
          showError("Error Deleting File(s)")
        }
      }
    } catch (error) {
      showError("Error Deleting File(s)")
    } finally {
      setIsLoading(false);
      setSelectedFileNames([]);
      setShowFileBox(false);
    }
  };

  const fileOptions = groupedFiles.map(group => ({
    label: group.id,
    options: group.files.map(file => ({ label: file.label, value: file.value }))
  }));

  const handleRemoveFile = (fileName) => {
    setSelectedFileNames(prevSelectedFileNames => prevSelectedFileNames.filter(name => name !== fileName));
  };

  const handleDeselectAll = () => {
    setSelectedFileNames([]);
    setShowFileBox(false);
  };

  return (
    <>
      <div className="flex justify-content-center align-items-center h-full">
        <form onSubmit={handleSubmit}>
            <Dropdown 
              id="delete-course" 
              value={selectedCourse} 
              options={courses}
              optionLabel="label" 
              placeholder="Select a Course" 
              onChange={(e) => handleCourseChange(e.value)} 
              className="m-1"
            />
            {selectedCourse && (
              <div className='w-20rem m-1'>
                <MultiSelect
                  value={selectedFileNames}
                  onChange={(e) => handleFileSelection(e.value)}
                  options={fileOptions}
                  optionLabel="label"
                  optionGroupLabel="label"
                  optionGroupChildren="options"
                  placeholder="Select Files"
                  scrollHeight="200px"
                  display="chip"
                  filter
                  className="w-full"

                />
              </div>
            )}
          {isLoading && <LoadingScreen/>}
        </form>
        </div>
        <div className='flex justify-content-between flex-wrap'>
          <div className='pl-5 pb-3'>
            <Button label='Back' iconPos='left' icon="pi pi-angle-double-left" onClick={handleBack}/>
          </div>
          <div className='pr-5 pb-3'>
            <Button label='Delete' iconPos='right' icon="pi pi-trash" severity='danger' disabled={!showFileBox} onClick={handleSubmit}/>
          </div>
        </div>
    </>
    
  );
}

export default DeleteForm;