import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock
from database.course_db import CourseDatabase

@pytest.fixture(scope="session")
def course_database():
    course = "example_course"
    course_db = CourseDatabase(course)
    course_db.db = MagicMock()
    course_db.course = course

    return course_db

def test_course_database_init(course_database):
    assert course_database.course == "example_course"
    assert course_database.db is not None

def test_get_unique_ids(course_database):
    course_database.db["example_course_index"].distinct.return_value = [1, 2, 3]
    
    unique_ids = course_database.get_unique_ids()
    assert unique_ids == [1, 2, 3]

def test_get_unique_files(course_database):
    course_database.db["example_course_index"].distinct.return_value = ["file1.txt", "file2.csv"]

    course_database.db["example_course_index"].find_one.side_effect = [
        {"id": "1"},
        {"id": "2"}
    ]
    
    unique_files = course_database.get_unique_files()
    assert unique_files == [
        {"id": "1", "files": [{"label": "file1", "value": "file1.txt"}]},
        {"id": "2", "files": [{"label": "file2", "value": "file2.csv"}]}
    ]

def test_transform_unique_ids():
    data = [
        {"file_name": "file1.txt", "id": "1"},
        {"file_name": "file2.csv", "id": "2"},
        {"file_name": "file1.txt", "id": "3"}
    ]

    expected_result = [
        {"id": "1", "files": [{"label": "file1", "value": "file1.txt"}]},
        {"id": "2", "files": [{"label": "file2", "value": "file2.csv"}]},
        {"id": "3", "files": [{"label": "file1", "value": "file1.txt"}]}
    ]

    result = CourseDatabase.transform_unique_ids(None, data)

    assert result == expected_result

    data = [
        {"file_name": "file1.txt", "id": "1"},
        {"file_name": "file2.csv", "id": "2"},
        {"file_name": "file1.txt", "id": "1"}
    ]

    expected_result = [
        {"id": "1", "files": [{"label": "file1", "value": "file1.txt"}, {"label": "file1", "value": "file1.txt"}]},
        {"id": "2", "files": [{"label": "file2", "value": "file2.csv"}]},
    ]

    result = CourseDatabase.transform_unique_ids(None, data)

    assert result == expected_result