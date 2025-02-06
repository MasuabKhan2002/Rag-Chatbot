import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Chatbot, { MessageScreen, Questions } from '../../../Components/homepage/Chatbot';
import * as speech from 'react-speech-recognition';

jest.mock('react-speech-recognition', () => ({
    useSpeechRecognition: jest.fn().mockReturnValue({
        transcript: 'Mocked transcript',
        listening: true,
        resetTranscript: jest.fn(),
        browserSupportsSpeechRecognition: true,
    },)}));

describe('Chatbot component', () => {
    test('renders Chatbot component with mocked speech recognition', () => {
        const userInfo = { userid: '123' };
        const setMessageLog = jest.fn();
        const showSuccess = jest.fn();
        const showError = jest.fn();

        jest.spyOn(speech, "useSpeechRecognition").mockReturnValue({
            transcript: 'Mocked transcript',
            listening: true,
            resetTranscript: jest.fn(),
            browserSupportsSpeechRecognition: true,
        });
    
        render(<Chatbot userInfo={userInfo} messageLog={[]} setMessageLog={setMessageLog} showSuccess={showSuccess} showError={showError} />);
    
        expect(screen.getByText('New Chat')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
    });

    test('check Chatbot component when set language pressed', async () => {
        const userInfo = { userid: '123' };
        const setMessageLog = jest.fn();
        const showSuccess = jest.fn();
        const showError = jest.fn();

        jest.spyOn(speech, "useSpeechRecognition").mockReturnValue({
            transcript: 'Mocked transcript',
            listening: true,
            resetTranscript: jest.fn(),
            browserSupportsSpeechRecognition: true,
        });

        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            json: () => Promise.resolve({ message: 'True' })
        });

        render(<Chatbot userInfo={userInfo} messageLog={[]} setMessageLog={setMessageLog} showSuccess={showSuccess} showError={showError} />);

        const button = screen.getByLabelText("Select a language")
        await act(async () => {
            fireEvent.click(button);
        });

        const languageButton = screen.getByLabelText("English")
        await act(async () => {
            fireEvent.click(languageButton);
        });

        expect(mockFetch).toHaveBeenCalled();
        expect(button).toBeInTheDocument();
    });
});

describe('MessageScreen component', () => {
    test('renders MessageScreen component with messages from messageLog', () => {
      const messageLog = [
        { type: 'bot', message: 'Hello, how can I assist you?' },
        { type: 'user', message: 'Can you help me with my account?' },
      ];
  
      render(<MessageScreen messageLog={messageLog} responding={false} questions={[]} handleSubmit={() => {}} updateValue={() => {}} />);
  
      expect(screen.getByText('Hello, how can I assist you?')).toBeInTheDocument();
      expect(screen.getByText('Can you help me with my account?')).toBeInTheDocument();
    });
  
    test('displays a progress spinner when responding is true', () => {
      const messageLog = [];
      render(<MessageScreen messageLog={messageLog} responding={true} questions={[]} handleSubmit={() => {}} updateValue={() => {}} />);
  
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});

describe('Questions component', () => {
    test('renders buttons for each question in the questions array', () => {
      const questions = [
        { Text: 'Question 1', Type: 'query' },
        { Text: 'Question 2', Type: 'cancel message' },
      ];
  
      render(<Questions questions={questions} handleSubmit={() => {}} updateValue={() => {}} />);
  
      expect(screen.getByText('Question 1')).toBeInTheDocument();
      expect(screen.getByText('Question 2')).toBeInTheDocument();
    });
  
    test('triggers handleSubmit function when a button is clicked', () => {
      const handleSubmitMock = jest.fn();
      const questions = [{ Text: 'Question', Type: 'query' }];
      render(<Questions questions={questions} handleSubmit={handleSubmitMock} updateValue={() => {}} />);
  
      fireEvent.click(screen.getByText('Question'));
  
      expect(handleSubmitMock).toHaveBeenCalled();
    });
  
    test('updates buttonValue state and calls updateValue when a button is clicked', () => {
      const updateValueMock = jest.fn();
      const questions = [{ Text: 'Question', Type: 'query' }];
      render(<Questions questions={questions} handleSubmit={() => {}} updateValue={updateValueMock} />);
  
      fireEvent.click(screen.getByText('Question'));
  
      expect(updateValueMock).toHaveBeenCalledWith('Question');
    });
});