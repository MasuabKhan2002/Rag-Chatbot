import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, src_dir)

import unittest
from unittest.mock import patch, MagicMock, ANY
from application import app

class TestFlaskApp(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()

    def test_set_language(self):
        language_data = {"language": "English"}

        response = self.app.post(f"/set_language", json=language_data)

        self.assertEqual(response.status_code, 200)

        self.assertIn(b"Language set successfully", response.data)

    @patch("application.user_db.get_user_data")
    @patch("application.NotificationEngine")
    def test_get_notifications(self, mock_notification_engine, mock_get_user_data):
        # Prepare test data
        user_id = "test_user"
        time = "2024-04-09"
        course = "test_course"
        user_information = {"course": course}
        notifications = [{"notifications": "Test notification"}]

        mock_get_user_data.return_value = user_information

        mock_notification_engine_instance = mock_notification_engine.return_value
        mock_notification_engine_instance.remove_duplicates.return_value = notifications

        response = self.app.post("/get_notifications", json={"userid": user_id, "time": time})

        self.assertEqual(response.status_code, 200)

        expected_response = {"notifications": notifications}
        self.assertEqual(response.json, expected_response)

    @patch("application.conversation_db.get_all_conversations")
    def test_get_conversations(self, mock_get_all_conversations):
        user_id = "m3fu78cLSyfni7dPOkoQBRs9FFe2"

        expected_conversations = [
            {"_id": "661b39fb7666b6a6b47255f5", "name": "Greeting Prompt"}
        ]
        mock_get_all_conversations.return_value = expected_conversations
        response = self.app.post(f"/get_conversations", json={"userid": user_id})

        self.assertEqual(response.status_code, 200)

        self.assertIn("conversations", response.json)

        self.assertEqual(response.json["conversations"], expected_conversations)

    @patch("application.conversation_db.load_conversation")
    def test_load_conversation(self, mock_load_conversation):
        # Prepare test data
        user_id = "test_user"
        document_id = "661b39fb7666b6a6b47255f5"
        conversation_data = [
            {"message": "Hi there, how can I help?", "type": "bot"},
            {"message": "hello", "type": "user"},
            {"message": "Hello! Do you need any help with something today?", "type": "bot"}
        ]

        mock_load_conversation.return_value = conversation_data

        response = self.app.post("/load_conversation", json={"userid": user_id, "document": document_id})

        self.assertEqual(response.status_code, 200)

        expected_response = {"conversation": conversation_data}
        self.assertEqual(response.json, expected_response)

    @patch("application.conversation_db.delete_conversation")
    def test_delete_conversation(self, mock_delete_conversation):
        user_id = "m3fu78cLSyfni7dPOkoQBRs9FFe2"
        document_id = "661b39fb7666b6a6b47255f5"

        response = self.app.post(f"/delete_conversation", json={"userid": user_id, "document": document_id})

        self.assertEqual(response.status_code, 200)

        mock_delete_conversation.assert_called_once_with(user_id, document_id)

        self.assertEqual("Successfully deleted conversation", response.json["message"])

    @patch("application.prompt_engine.name_conversation")
    @patch("application.conversation_db.create_conversation_doc")
    def test_save_conversation(self, mock_create_conversation_doc, mock_name_conversation):
        user_id = "m3fu78cLSyfni7dPOkoQBRs9FFe2"
        conversation_name = ""
        conversation_data = [
            {
                "message": "Hi there, how can I help?",
                "type": "bot"
            },
            {
                "message": "hello",
                "type": "user"
            },
            {
                "message": "I'm here to help. What do you need assistance with?",
                "type": "bot"
            },
        ]

        mock_name_conversation.return_value = "mock generated name"

        response = self.app.post(f"/save_conversation", json={"userid": user_id, "conversation": conversation_data, "conversation_name": conversation_name})

        mock_create_conversation_doc.assert_called_once_with(user_id, conversation_data, "mock generated name")

        self.assertEqual(response.status_code, 200)
        self.assertEqual("Saved Conversation", response.json["message"])

    @patch("application.user_db.create_collection")
    @patch("application.user_db.upload_user_information")
    @patch("application.db.add_nodes_from_json")
    def test_first_time_sign_in_success(self, mock_add_nodes, mock_upload_user_info, mock_create_collection):
        user_id = "test_user"
        request_json = {
            "userid": "test_user",
            "course": "test_course",
            "name": "test_name",
            "studentid": "12345678",
            "email": "test@email.com",
            "campus": ["test"]
        }
        
        response = self.app.post("/first_time_sign_in", json=request_json)

        self.assertEqual(response.status_code, 200)

        mock_create_collection.assert_called_once_with(user_id)
        mock_upload_user_info.assert_called_once_with(request_json, user_id)
        mock_add_nodes.assert_called_once_with(request_json, 'user_index', 'user_index', 'user_index', user_id)

    @patch("application.user_db.check_collection_exist", MagicMock(return_value=True))
    def test_check_sign_in(self):
        user_id = "test_user"
        request_json = {"userid": user_id}
        response = self.app.post("/check_sign_in", json=request_json)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "True")
    
    @patch("application.db.add_nodes")
    def test_upload_index_valid_input(self, mock_add_nodes):
        base64_encoded_data = "VGhpcyBpcyBhIGZha2UgZGF0YQ=="
        request_json = {
            "db": "test_db",
            "collection": "test_collection",
            "type": "test_type",
            "index": "test_index",
            "path": {
                "data": base64_encoded_data,
                "name": "test_file.txt",
                "directory": "optional_directory_here"
            },
            "id": "test_id",
            "upload_method": "dir"
        }

        response = self.app.post("/upload_index", json=request_json)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "File data received and saved successfully")

        mock_add_nodes.assert_called_once_with(
            ANY,  
            "test_db",
            "test_collection",
            "test_index",
            "test_id",
            "test_type"
        )

    @patch("application.QuestionEngine.get_all_questions")
    def test_get_questions_no_conversation_in_progress(self, mock_get_all_questions):
        mock_get_all_questions.return_value = [
            {"Type": "question1_type", "Text": "Question 1"},
            {"Type": "question2_type", "Text": "Question 2"},
            {"Type": "question3_type", "Text": "Question 3"}
        ]

        response = self.app.get("/questions")

        self.assertEqual(response.status_code, 200)

        expected_questions = [
            {"Type": "question1_type", "Text": "Question 1"},
            {"Type": "question2_type", "Text": "Question 2"},
            {"Type": "question3_type", "Text": "Question 3"}
        ]

    @patch("application.conversation_in_progress", True)
    @patch("application.chat_engine", MagicMock())
    @patch("application.prompt_engine.prompt_template", {"cancel_message": "Cancel"})
    @patch("application.QuestionEngine.get_condition_question")
    def test_get_questions_conversation_in_progress(self, mock_get_condition_question):
        mock_get_condition_question.return_value = [
            {"Type": "question4_type", "Text": "Question 4"},
            {"Type": "question5_type", "Text": "Question 5"}
        ]

        response = self.app.get("/questions")

        self.assertEqual(response.status_code, 200)

        expected_questions = [
            {"Type": "question4_type", "Text": "Question 4"},
            {"Type": "question5_type", "Text": "Question 5"},
            {"Type": "cancel message", "Text": "Cancel"}
        ]
        self.assertEqual(response.json, expected_questions)

    @patch("application.user_db.get_user_data")
    @patch("application.QueryEngine")
    @patch("application.ChatEngine")
    @patch("application.conversation_in_progress", False)
    @patch("application.prompt_engine.match_prompt")
    @patch("application.prompt_engine.set_prompt_placeholders")
    @patch("application.prompt_engine.prompt_template", {"type": "query"})
    def test_query_no_conversation_in_progress_query(self, mock_set_prompt_placeholders, mock_match_prompt,
                                                     MockChatEngine, MockQueryEngine, mock_get_user_data):
        user_id = "test_user"
        message = "What is my name?"
        course = "test_course"
        mock_get_user_data.return_value = {"course": course}

        mock_query_engine_instance = MockQueryEngine.return_value
        mock_chat_engine_instance = MockChatEngine.return_value
        mock_query_engine_instance.query.return_value = "Mocked query response"
        mock_chat_engine_instance.chat.return_value = "Mocked chat response"

        response = self.app.post("/query", json={"userid": user_id, "message": message})

        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.text, "Mocked query response")

        mock_match_prompt.assert_called_once_with(message)
        mock_set_prompt_placeholders.assert_called_once_with(course, user_id)

        MockQueryEngine.assert_called_once()
        mock_query_engine_instance.set_filters.assert_called_once()
        MockChatEngine.assert_not_called()

    @patch("application.user_db.get_user_data")
    @patch("application.QueryEngine")
    @patch("application.ChatEngine")
    @patch("application.conversation_in_progress", False)
    @patch("application.prompt_engine.match_prompt")
    @patch("application.prompt_engine.set_prompt_placeholders")
    @patch("application.prompt_engine.prompt_template", {"type": "chat"})
    def test_query_no_conversation_in_progress_chat(self, mock_set_prompt_placeholders, mock_match_prompt,
                                                     MockChatEngine, MockQueryEngine, mock_get_user_data):
        user_id = "test_user"
        message = "What is my name?"
        course = "test_course"
        mock_get_user_data.return_value = {"course": course}

        mock_query_engine_instance = MockQueryEngine.return_value
        mock_chat_engine_instance = MockChatEngine.return_value
        mock_query_engine_instance.query.return_value = "Mocked query response"
        mock_chat_engine_instance.chat.return_value = "Mocked chat response"

        response = self.app.post("/query", json={"userid": user_id, "message": message})

        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.text, "Mocked chat response")

        mock_match_prompt.assert_called_once_with(message)
        mock_set_prompt_placeholders.assert_called_once_with(course, user_id)

        MockChatEngine.assert_called_once()
        mock_chat_engine_instance.set_filters.assert_called_once()
        mock_chat_engine_instance.prompt_step.assert_called_once_with(message)
        MockQueryEngine.assert_not_called()

    @patch("application.user_db.get_user_data")
    @patch("application.conversation_in_progress", True)
    @patch("application.chat_engine")
    @patch("application.prompt_engine.prompt_template", {"cancel_message": "Cancel"})
    @patch("application.QueryEngine")
    @patch("application.ChatEngine")
    def test_query_conversation_cancel(self, MockChatEngine, MockQueryEngine, mock_chat_engine, mock_get_user_data):
        user_id = "test_user"
        course = "test_course"
        message = "Cancel"
        mock_get_user_data.return_value = {"course": course}

        response = self.app.post("/query", json={"userid": user_id, "message": message})

        MockQueryEngine.assert_not_called()
        MockChatEngine.assert_not_called()
        mock_chat_engine.prompt_step.assert_called_once_with(message)
        mock_chat_engine.chat.assert_called_once_with(message, "English")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(mock_chat_engine.step, 0)

    @patch("application.admin_database.check_collection_exist")
    def test_admin_check_sign_in(self, mock_check_admin_exists):
        user_id = "test_user"

        mock_check_admin_exists.return_value = True

        response = self.app.post("/admin/check_sign_in", json={"userid": user_id})

        mock_check_admin_exists.assert_called_once_with(user_id)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "True")

    @patch("application.admin_database.create_collection")
    @patch("application.admin_database.upload_user_information")
    def test_admin_first_time_sign_in_success(self, mock_upload_user_info, mock_create_collection):
        user_id = "test_user"
        passkey = "adminPasskey123"
        request_json = {
            "userid": user_id,
            "course": "test_course",
            "passkey": passkey
        }

        mock_create_collection.return_value = None
        mock_upload_user_info.return_value = None

        response = self.app.post("/admin/first_time_sign_in", json=request_json)

        self.assertEqual(response.status_code, 200)

        mock_create_collection.assert_called_once_with(user_id)
        mock_upload_user_info.assert_called_once_with({"userid": user_id, "course": "test_course"}, user_id)

        expected_message = "Successfully created admin profile."
        self.assertEqual(response.json["message"], expected_message)

        request_json["passkey"] = "invalid_passkey"
        response = self.app.post("/admin/first_time_sign_in", json=request_json)

        self.assertEqual(response.status_code, 400)

        expected_error_message = "Invalid passkey"
        self.assertEqual(response.json["error"], expected_error_message)

        mock_create_collection.assert_called_once_with(user_id)
        mock_upload_user_info.assert_called_once_with({"userid": user_id, "course": "test_course"}, user_id)

    @patch("application.index_engine.delete_doc_from_index")
    def test_delete_node_success(self, mock_delete_doc_from_index):
        request_data = {
            "db": "test_db",
            "collection": "test_collection",
            "index": "test_index",
            "doc": "test_doc"
        }

        response = self.app.post("/delete_node", json=request_data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["message"], "Succesfully deleted node from index")

        mock_delete_doc_from_index.assert_called_once_with("test_db", "test_collection", "test_index", "test_doc")

    @patch("application.index_engine.delete_doc_from_index")
    def test_delete_node_failure(self, mock_delete_doc_from_index):
        mock_delete_doc_from_index.side_effect = Exception("Mocked exception")

        request_data = {
            "db": "test_db",
            "collection": "test_collection",
            "index": "test_index",
            "doc": "test_doc"
        }

        response = self.app.post("/delete_node", json=request_data)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json["error"], "Mocked exception")

        mock_delete_doc_from_index.assert_called_once_with("test_db", "test_collection", "test_index", "test_doc")

    @patch("application.admin_database.get_user_data")
    @patch("application.CourseDatabase.get_unique_files")
    def test_admin_get_unique_files(self, mock_get_unique_files, mock_get_user_data):
        user_id = "test_user"
        course = "test_course"
        unique_files = [{"file_name": "Test File", "id": "1234567890"}]
        mock_get_unique_files.return_value = unique_files

        response = self.app.post("/admin/get_unique_files", json={"userid": user_id, "course": course})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, unique_files)

        mock_get_user_data.assert_called_once_with(user_id)
        mock_get_unique_files.assert_called_once_with()