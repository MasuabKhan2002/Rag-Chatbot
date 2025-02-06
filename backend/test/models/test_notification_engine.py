import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock
from models.notification_engine import NotificationEngine

@pytest.fixture
def notification_engine():
    index_engine = MagicMock()
    index_engine.load_index.return_value = "index"

    return NotificationEngine(index_engine, "example_course")

def test_init(notification_engine):
    assert notification_engine.index_engine.load_index.return_value == "index"
    assert notification_engine.filters is None
    assert notification_engine.course == "example_course"

def test_set_filters_success(notification_engine):
    creation_date = "2022-04-01"
    notification_engine.set_filters(creation_date)
    assert notification_engine.filters is not None

def test_set_filters_error(notification_engine):
    notification_engine.set_filters = Exception("Mocked exception")

    with pytest.raises(Exception):
            notification_engine.set_filters("2024-04-13")
            assert Exception == f"Error creating filters"

def test_remove_duplicates(notification_engine):
    notifications = [
        {"course": "course1", "name": "file1"},
        {"course": "course2", "name": "file2"},
        {"course": "course1", "name": "file1"}
    ]
    unique_notifications = notification_engine.remove_duplicates(notifications)
    assert len(unique_notifications) == 2

def test_get_notifications_success(notification_engine):
    notification_engine.index_engine.load_index.return_value = None
    notification_engine.index_engine.index.as_retriever.return_value = MagicMock()
    notification_engine.index_engine.index.as_retriever().retrieve.return_value = [
        MagicMock(metadata={"file_name": "file1"}, id_="course1"),
        MagicMock(metadata={"file_name": "file2"}, id_="course2")
    ]

    creation_date = "2022-04-01"
    notifications = notification_engine.get_notifications(creation_date)
    assert len(notifications) == 2

def test_get_notifications_error(notification_engine):
    notification_engine.get_notifications = Exception("Mocked exception")

    with pytest.raises(Exception):
            notification_engine.set_filters("2024-04-13")
            assert Exception == f"Error getting Notifications"