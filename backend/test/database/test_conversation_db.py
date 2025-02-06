import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock
from database.conversation_db import ConversationDatabase
from bson import ObjectId


@pytest.fixture(scope="session")
def conversation_database():
    conversation_db = ConversationDatabase()
    conversation_db.db = MagicMock()

    return conversation_db

def test_create_conversation_doc(conversation_database):
    collection_mock = MagicMock()
    conversation_database.db.__getitem__.return_value = collection_mock
    
    conversation_database.create_conversation_doc("collection_name", {"data": "example"}, "conversation_name")
    collection_mock.insert_one.assert_called_once()
    
    collection_mock.insert_one.side_effect = Exception("Mocked exception")
    with pytest.raises(Exception):
        conversation_database.create_conversation_doc("collection_name", {"data": "example"}, "conversation_name")

def test_get_all_conversations_success(conversation_database):
    collection_mock = MagicMock()
    conversation_database.db.__getitem__.return_value = collection_mock
    
    conversations = [{'_id': '1', 'name': 'Conversation 1'}, {'_id': '2', 'name': 'Conversation 2'}]
    collection_mock.find.return_value = conversations
    
    result = conversation_database.get_all_conversations("collection_name")
    
    assert result == conversations

def test_get_all_conversations_empty(conversation_database):
    collection_mock = MagicMock()
    conversation_database.db.__getitem__.return_value = collection_mock
    collection_mock.find.return_value = []
    
    result = conversation_database.get_all_conversations("collection_name")
    
    assert result == []

def test_get_all_conversations_exception(conversation_database):
    collection_mock = MagicMock()
    collection_mock.find.side_effect = Exception("Mocked exception")
    conversation_database.db.__getitem__.return_value = collection_mock
    
    with pytest.raises(Exception):
        conversation_database.get_all_conversations("collection_name")
        assert Exception == "Error getting previous conversations."

def test_load_conversation_success(conversation_database):
    collection_mock = MagicMock()
    conversation_database.db.__getitem__.return_value = collection_mock
    
    conversation_data = {'data': 'Conversation data'}
    document_id = ObjectId()
    collection_mock.find_one.return_value = {'_id': document_id, 'data': conversation_data}
    
    result = conversation_database.load_conversation("collection_name", str(document_id))
    
    assert result == conversation_data

def test_load_conversation_nonexistent(conversation_database):
    collection_mock = MagicMock()
    conversation_database.db.__getitem__.return_value = collection_mock
    collection_mock.find_one.return_value = None
    
    result = conversation_database.load_conversation("collection_name", str(ObjectId()))
    
    assert result is None

def test_load_conversation_invalid_id(conversation_database):
    with pytest.raises(Exception) as excinfo:
        conversation_database.load_conversation("collection_name", "invalid_id")
    
    assert "Error loading conversation:" in str(excinfo.value)

def test_delete_conversation_success(conversation_database):
    collection_mock = MagicMock()
    conversation_database.db.__getitem__.return_value = collection_mock
    
    delete_result_mock = MagicMock()
    delete_result_mock.deleted_count = 1
    collection_mock.delete_one.return_value = delete_result_mock
    
    result = conversation_database.delete_conversation("collection_name", str(ObjectId()))
    
    assert result is True

def test_delete_conversation_nonexistent(conversation_database):
    collection_mock = MagicMock()
    conversation_database.db.__getitem__.return_value = collection_mock
    
    delete_result_mock = MagicMock()
    delete_result_mock.deleted_count = 0
    collection_mock.delete_one.return_value = delete_result_mock
    
    with pytest.raises(Exception) as excinfo:
        conversation_database.delete_conversation("collection_name", str(ObjectId()))
    
    assert "Error deleting conversation" in str(excinfo.value)