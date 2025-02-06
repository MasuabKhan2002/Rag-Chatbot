import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock
from database.user_db import UserDatabase

@pytest.fixture
def user_database():
    user_db = MagicMock(spec=UserDatabase)
    user_db.db = MagicMock()
    return user_db

def test_check_collection_exist(user_database):
    user_database.check_collection_exist.return_value = False
    userid = "AnotherUser456"
    assert not user_database.check_collection_exist(userid)

    user_database.check_collection_exist.return_value = True
    json_data = {
        "_id": "user_information",
        "userid": "AnotherUser456",
        "course": "CASE4",
        "name": "Jane Smith",
        "studentid": 87654321,
        "email": "jane.smith@example.com",
        "campus": ["Glasnevin"]
    }
    user_database.upload_user_information(json_data, userid)
    assert user_database.check_collection_exist(userid)

def test_create_collection(user_database):
    collection_name = "NewCollection"
    user_database.create_collection(collection_name)

    user_database.create_collection.assert_called_once_with(collection_name)

def test_get_user_data(user_database):
    userid = "TestUser123"
    expected_document = {
        "_id": "user_information",
        "userid": userid,
        "course": "CASE4",
        "name": "John Doe",
        "studentid": 12345678,
        "email": "john.doe@example.com",
        "campus": ["Glasnevin"]
    }

    user_database.get_user_data.return_value = expected_document

    result = user_database.get_user_data(userid)

    assert result == expected_document

    user_database.get_user_data.assert_called_once_with(userid)