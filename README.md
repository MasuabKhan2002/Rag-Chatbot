# DCU Loop Chatbot

## Overview

The **DCU Loop Chatbot** is an AI-powered chatbot designed to enhance student interactions with Dublin City University's online learning platform, **Loop**. Built using **Retrieval-Augmented Generation (RAG)**, the chatbot provides **context-aware, multilingual, and accessible** responses to student queries regarding **modules, timetables, campus resources, and more**.

### Key Technologies
- **Flask (Python)** for the backend API
- **React.js** for the frontend interface
- **MongoDB** for efficient data retrieval
- **OpenAI API** for intelligent query responses
- **Firebase** for authentication and storage
- **Llama-Index** for optimized information indexing and retrieval

## Features

- **Smart Query Handling:** Combines information retrieval with generative AI to provide **accurate, context-aware responses**.
- **Multilingual Support:** Allows students to interact in **English, Irish, French, German, and Spanish**.
- **Accessibility Features:** Integrates **text-to-speech (TTS) and speech-to-text (STT)** functionalities.
- **User Authentication:** Supports secure **Google-based sign-in** with **DCU accounts**.
- **Conversation History:** Users can **save, load, and delete conversations** for future reference.
- **Admin Panel:** Admins can **upload and delete course materials** dynamically.
- **Testing & Reliability:** Includes **unittest, pytest, jest, and React Testing Library** for rigorous backend and frontend testing.

## How It Works

1. **User Authentication:**  
   - Students and admins log in via **Google Authentication**.
   - Admins have additional permissions for managing course materials.

2. **Query Processing:**  
   - Users can interact with the chatbot using **text input** or **suggested question buttons**.
   - The chatbot retrieves relevant academic content via **MongoDB + OpenAI**.

3. **Saved Conversations:**  
   - Users can **save and retrieve past conversations**.
   - The chatbot automatically generates a conversation name if left blank.

4. **Admin Management:**  
   - Admins can **upload course files** (PDFs, PPTs, DOCXs, etc.).
   - The system dynamically **indexes and retrieves** updated data.