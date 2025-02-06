import React, { useState, useRef, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { ScrollPanel } from 'primereact/scrollpanel';
import { getUserInformation } from '../../Firebase/auth';
import LoadingScreen from '../signin/LoadingScreen';

const UploadForm = ({showSuccess, showError, handleBack}) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [type, setType] = useState('');
  const [files, setFiles] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [moduleDisabled, setModuleDisabled] = useState(true);
  const [filesSelected, setFilesSelected] = useState(false);
  const [moduleSelected, setModuleSelected] = useState(false);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const userInfo = await getUserInformation();
        setUserInfo(userInfo);
      } catch (error) {
        showError('Error fetching user information');
      }
    }
    fetchData();
  }, []);

  const courses = [
    { label: 'CASE4', value: 'CASE4' },
    { label: 'CASE3', value: 'CASE3' },
    { label: 'CASE2', value: 'CASE2' },
    { label: 'CASE1', value: 'CASE1' }
  ];

  const handleCourseChange = async (event) => {
    setSelectedCourse(event.value);
    setSelectedModule('');
    setModuleDisabled(false);
    setModuleSelected(false);
    setType('');

    try {
      const response = await fetch('http://127.0.0.1:5000/admin/get_unique_files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userid: userInfo.userid, course: event.value })
      });
      const data = await response.json();
      if (response.ok && data.length > 0) {
        const modulesData = data.map(item => ({ label: item.id, value: item.id }));
        setModules(modulesData);
      } else {
        showError('Failed to fetch modules');
        setModules([]);
      }
    } catch (error) {
      showError('Error fetching modules');
      setModules([]);
    }
  };

  const handleModuleChange = (event) => {
    setSelectedModule(event.value);
    setModuleSelected(true);
  };

  const handleTypeChange = (event) => {
    setType(event.value);
  };

  const handleFileUpload = (event) => {
    try {
      const uploadedFiles = event.target.files;
      const updatedFiles = [...files];
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = e.target.result;
          let directoryName = '';
          if (type === 'dir') {
            const webkitRelativePath = file.webkitRelativePath;
            if (webkitRelativePath) {
              directoryName = webkitRelativePath.split('/')[0];
            }
          }
          updatedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            data: fileData,
            directory: directoryName
          });
          setFiles(updatedFiles);
          setFilesSelected(true);
        };
        reader.readAsDataURL(file);
      }
      showSuccess("Selected File(s)");
    } catch (error) {
      showError("Failed to select File(s)");
    }
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
    showSuccess("Removed File")
    if (updatedFiles.length === 0) {
      setFilesSelected(false);
    }
  };

  const deselectAllFiles = () => {
    setFiles([]);
    setFilesSelected(false);
  };

  const getAcceptedFileTypes = () => {
    return '*';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];

      const jsonFormData = {
        db: selectedCourse,
        collection: `${selectedCourse}_index`,
        type: 'file',
        index: 'course_index',
        id: selectedModule.toLowerCase(),
        path: fileData,
        upload_method: type === 'dir' ? 'dir' : 'file'
      };
      try {
        const jsonData = JSON.stringify(jsonFormData);

        const response = await fetch('http://127.0.0.1:5000/upload_index', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: jsonData,
          credentials: 'include'
        });
        if (!response.ok) {
          showError("Error uploading file(s)");
          return;
        }

        const data = await response.json();
        showSuccess(data.message);
      } catch (error) {
        showError("Error uploading file(s)")
      }
    }

    setSelectedCourse('');
    setSelectedModule('');
    setType('');
    setFiles([]);
    setIsLoading(false);
    setFilesSelected(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex justify-content-center align-items-center h-full">
        <div>
          <div className="flex">
            <Dropdown id="course" value={selectedCourse} options={courses} onChange={handleCourseChange} placeholder="Select Course" className="mr-1 my-1" />
            {selectedCourse && (
              <div className="py-1">
                <Dropdown id="module" value={selectedModule} options={modules} onChange={handleModuleChange} placeholder="Select Module" className="form-dropdown" disabled={moduleDisabled} />
              </div>
            )}
          </div>
          <div className='flex w-full'>
            {moduleSelected && (
              <div className="py-1">
                <Dropdown id="type" value={type} options={[{label: 'File', value: 'file'}, {label: 'Directory', value: 'dir'}]} onChange={handleTypeChange} placeholder="Select Upload Method" className="mr-1"/>
              </div>
            )}
            {type && (
              <div className="flex align-items-center">
                <input type="file" id="file" accept={getAcceptedFileTypes()} onChange={handleFileUpload} multiple={type === 'file'} {...(type === 'dir' && { directory: 'true', webkitdirectory: 'true' })} className="text-gray-200" />
              </div>
            )}
          </div>
          {filesSelected && (
            <div className="bg-gray-700 m-2 border-round shadow-3 w-full overflow-auto h-10rem">
              <Button onClick={deselectAllFiles} label="Deselect All" size='small' severity='danger' outlined className='mt-2 mx-2'/>
                <div className="m-1">
                  {files.map((file, index) => (
                    <div key={index} className="flex align-items-center">
                      <div className='text-gray-100 m-1 text-lg'>{file.name}</div>
                      <Button type="button" icon="pi pi-trash" className="m-1" onClick={() => handleRemoveFile(index)} />
                    </div>
                  ))}
                </div>
            </div>
          )}
          {isLoading && <LoadingScreen/>}
        </div>
      </form>
      <div className='flex justify-content-between flex-wrap'>
        <div className='pl-5 pb-3'>
          <Button label='Back' iconPos='left' icon="pi pi-angle-double-left" onClick={handleBack}/>
        </div>
        <div className='pr-5 pb-3'>
          <Button label='Submit' iconPos='right' icon="pi pi-upload" severity='success' disabled={!filesSelected} onClick={handleSubmit}/>
        </div>
      </div>
    </>
  );
}

export default UploadForm;
