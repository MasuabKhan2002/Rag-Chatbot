import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getImageFromStorage } from '../../Firebase/storage';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useSpeechSynthesis } from "react-speech-kit";

function Chatbot({ userInfo, messageLog, setMessageLog, showSuccess, showError }) {
    const [value, setValue] = useState('');
    const [responding, setResponding] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const languages = [
        { name: 'English', },
        { name: 'Irish' },
        { name: 'French' },
        { name: 'Spanish' },
        { name: 'German' }
    ];
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const op = useRef(null);
    const [conversationName, setConversationName] = useState('');

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    const handleStartListening = () => {
        resetTranscript();
        SpeechRecognition.startListening();
    }

    useEffect (() => {
        setValue(transcript);
    }, [transcript]);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQuestions();
        }, 100);
    
        return () => clearTimeout(timer);
    }, [userInfo.userid]);

    const newConversation = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/save_conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userid: userInfo.userid, conversation: messageLog, conversation_name: conversationName })
            });
    
            if (!response.ok) {
                throw new Error('Failed to save conversation');
            }
    
            window.location.reload();

            showSuccess('Saved Conversation');
    
        } catch (error) {
            console.error('Error saving conversation:', error);
            showError('Failed to save conversation');
        }
    };

    const fetchQuestions = async () => {
        try {
            if (!userInfo.userid) {
                return;
            }
            const response = await fetch('http://127.0.0.1:5000/questions');
            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
            showError("Failed to fetch questions")
        }
    };

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }
        const messageTosend = transcript || value; // Send the transcript if it exists, otherwise send the value
        if (messageTosend.trim() !== '') {
            const trimmedValue = value.trim();
            setMessageLog(prevState => [
                ...prevState,
                { type: 'user', message: trimmedValue }
            ]);
            
            setResponding(true);
    
            try {
                const response = await fetch('http://127.0.0.1:5000/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userid: userInfo.userid, message: trimmedValue })
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch response');
                }
                else {
                    const responseData = await response.text();
                    setMessageLog(prevState => [
                        ...prevState,
                        { type: 'bot', message: responseData}
                    ]);
                }
            } catch (error) {
                console.error('Error:', error);
                showError("Chatbot response failed");
            }
    
            setValue('');
            setResponding(false);
            fetchQuestions();
            resetTranscript();
        }
    };

    const handleSetLanguage = async (language) => {
        try {
          const response = await fetch('http://127.0.0.1:5000/set_language', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ language: language.name })
          });

          if (response.ok) {
            const responseData = await response.json();
            showSuccess(responseData.response);
            setSelectedLanguage(language);
          } else {
            showError('Failed to set language');
          }
        } catch (error) {
          console.error('Error setting language:', error);
          showError('Failed to set language');
        }
    };

    return (
        <>
            <div className='bg-gray-900 h-screen flex justify-content-center'>
                <div className="flex flex-column w-11">
                    <div className='bg-gray-900 flex flex-row-reverse'>
                    <Button 
                        label='New Chat' 
                        className='m-1' 
                        size="small"
                        icon="pi pi-file-edit" 
                        iconPos='right'
                        disabled={messageLog.length === 1} 
                        onClick={(e) => op.current.toggle(e)} />
                    <OverlayPanel ref={op}>
                        <div>
                            <div className='text-lg font-medium p-1'>Add a Conversation Name</div>
                            <InputText value={conversationName} onChange={(e) => setConversationName(e.target.value)} className="w-full mt-2" aria-describedby="savename-help"/>
                            <small id="savename-help">
                                Leave blank to automatically generate name.
                            </small>
                            <div className='flex flex-row-reverse p-1 pt-3'>
                                <Button label='Save' icon='pi pi-check' iconPos='right' onClick={newConversation}/>
                            </div>
                        </div>
                    </OverlayPanel>
                    <Button
                        label={listening ? 'Stop Speaking' : 'Start Speaking'}
                        className="m-1"
                        severity={`${listening ? "danger" : "success"}`}
                        size="small"
                        icon="pi pi-microphone"
                        iconPos='right'
                        onClick={handleStartListening}/>
                    <Dropdown 
                        value={selectedLanguage} 
                        onChange={(e) => handleSetLanguage(e.value)} 
                        options={languages} 
                        optionLabel="name"
                        placeholder='Select a language'
                        className="w-full md:w-14rem h-3rem m-1" />
                    </div>
                    <MessageScreen 
                        messageLog={messageLog} 
                        responding={responding} 
                        questions={questions} 
                        handleSubmit={handleSubmit}
                        updateValue={setValue}/>
                    <form onSubmit={handleSubmit} className="flex justify-content-center">
                        <InputText value={value} onChange={(e) => setValue(e.target.value)} 
                            className='w-10' placeholder='Ask a question'/>
                        <Button type="submit" label="Send" icon="pi pi-send" className='mx-1' iconPos="right"/>
                    </form>
                </div>
            </div>
        </>
    );
}

function MessageScreen({ messageLog, responding, questions, handleSubmit, updateValue }) {
    const [chatbotImage, setChatbotImage] = useState('');
    const { speak } = useSpeechSynthesis();

    useEffect(() => {
        async function fetchData() {
          try {
            const chatbotImagePath = 'gs://dcu-loop-chatbot.appspot.com/chatbot (2).png';
            const chatbotImage = await getImageFromStorage(chatbotImagePath);
            setChatbotImage(chatbotImage);
        } catch (error) {
            console.error('Error fetching data:', error);
          }
        }
    
        fetchData();
    }, []);

    const Typewriter = useMemo(() => {
        return ({ text, delay }) => {
            const [currentText, setCurrentText] = useState('');
            const [currentIndex, setCurrentIndex] = useState(0);
          
            useEffect(() => {
                if (currentIndex < text.length) {
                  const timeout = setTimeout(() => {
                    setCurrentText(prevText => prevText + text[currentIndex]);
                    setCurrentIndex(prevIndex => prevIndex + 1);
                  }, delay);
              
                  return () => clearTimeout(timeout);
                }
              }, [currentIndex, delay, text]);
          
            return (
                <div style={{ whiteSpace: 'pre-line' }}>
                    {currentText}
                </div>);
        };
    }, [messageLog]);

    const handleTextToSpeech = async (message) => {
        try {
            await speak({ text: message });
        } catch (error) {
            console.error('Failed to speak message: ', error);
            showError('Speech unavailable');
        }
        
    }

    return (
        <div className="flex flex-column-reverse bg-gray-900" style={{ height: '75vh', overflowY: 'auto' }}>
            <Questions questions={questions} handleSubmit={handleSubmit} updateValue={updateValue}/>
            {responding && (
                <div className="p-2" >
                    <ProgressSpinner style={{width: '50px', height: '50px'}} />
                </div>
            )}
            {messageLog.slice().reverse().map((message, index) => (
                <div key={index}>
                    {message.type === 'bot' ? (
                        <div className="flex flex-row align-items-end">
                            <div className='flex align-items-center justify-content-center pb-3 pl-4 pr-2'>
                                <img src={chatbotImage} alt="Logo" className="h-3rem"/>
                            </div>
                            <div className='mb-3 bg-primary-800 text-white p-2 ml-2 border-round-2xl mr-3 max-w-30rem'>
                            {index === 0 ? (
                                <Typewriter text={message.message} delay={10} />
                            ) : (
                                <div style={{ whiteSpace: 'pre-line' }}>
                                    {message.message}
                                </div>
                            )}
                            <button 
                              style={{backgroundColor: 'transparent', border: 'none', cursor: 'pointer'}} 
                              onClick={() => handleTextToSpeech(message.message)}>
                                <span className='pi pi-volume-up' style={{color: 'white'}}/>
                            </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-row-reverse pb-3 pr-3 ml-4 ">
                            <div className='max-w-30rem'>
                                <div className='bg-gray-700 text-white p-2 border-round-2xl'>{message.message}</div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function Questions({questions, handleSubmit, updateValue}) {
    const [buttonValue, setButtonValue] = useState('');

    useEffect(() => {
        if (buttonValue !== '') {
            handleSubmit();
            setButtonValue('');
        }
    }, [buttonValue, handleSubmit]);

    const handleButtonSubmit = (e, text) => {
        e.preventDefault();
        updateValue(text);
        setButtonValue(text)
    };

    return (
        <div className='flex flex-row-reverse'>
            {questions.map((question, index) => (
                <Button 
                    key={index} 
                    severity={
                        question.Type === 'query' ? 'primary' : 
                        question.Type === 'cancel message' ? 'danger' : 
                        'success'
                    } 
                    className='p-2 m-2'
                    label={question.Text}
                    onClick={(e) => handleButtonSubmit(e, question.Text)} />
            ))}
        </div>
    );
}

export default Chatbot;
export {MessageScreen, Questions};
