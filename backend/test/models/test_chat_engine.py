import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock
from models.chat_engine import ChatEngine
from pytest_mock import mocker

@pytest.fixture
def chat_engine():
    index_engine = MagicMock()
    index_engine.load_index.return_value = "index"
    prompt_template = {
        'db': 'test_db',
        'collection': 'test_collection',
        'index': 'test_index',
        'steps': [
            {'id': 0, 'query_condition': "None", 'message': "Step 1 message"},
            {'id': 1, 'query_condition': ["Item1", "Item2"], 'message': "Step 2 message"},
            {'id': 2, 'query_condition': "modules", 'message': "Step 3 message"}
        ],
        'filters': 'test_filters',
        'cancel_message': "Cancel message"
    }
    return ChatEngine(index_engine, prompt_template, "example_course")

def test_init(chat_engine):
    assert chat_engine.index_engine.load_index.return_value == "index"
    assert chat_engine.prompt_template == {
        'db': 'test_db',
        'collection': 'test_collection',
        'index': 'test_index',
        'steps': [
            {'id': 0, 'query_condition': "None", 'message': "Step 1 message"},
            {'id': 1, 'query_condition': ["Item1", "Item2"], 'message': "Step 2 message"},
            {'id': 2, 'query_condition': "modules", 'message': "Step 3 message"}
        ],
        'filters': 'test_filters',
        'cancel_message': "Cancel message"
    }
    assert chat_engine.course == "example_course"
    assert chat_engine.prompt_text is None
    assert chat_engine.filters is None
    assert chat_engine.memory is not None
    assert chat_engine.step == 0

def test_find_item_in_list(chat_engine):
    lst = ["Item1", "Item2", "Item3"]
    assert chat_engine.find_item_in_list("Item1", lst) == "Item1"
    assert chat_engine.find_item_in_list("Item4", lst) is None

def test_get_modules(chat_engine, mocker):
    mocker.patch.object(chat_engine, 'get_modules', return_value=["Module1", "Module2"])
    
    modules = chat_engine.get_modules()
    
    assert modules == ["Module1", "Module2"]

def test_prompt_step_none_condition(chat_engine):
    chat_engine.prompt_step("Test message")
    
    assert chat_engine.prompt_text == "Step 1 message"
    assert chat_engine.step == 1

def test_prompt_step_list_condition(chat_engine):
    chat_engine.step = 1
    chat_engine.prompt_step("Item1")

    assert chat_engine.prompt_text == "Step 2 message"

def test_prompt_step_modules_condition(chat_engine, mocker):
    chat_engine.step = 2
    mocker.patch.object(chat_engine, 'get_modules', return_value=["Module1", "Module2"])
    chat_engine.prompt_step("Module1")

    assert chat_engine.prompt_text == "Step 3 message"
    assert chat_engine.step == 3

def test_set_filters_with_filters(chat_engine):
    chat_engine.index_engine.load_index.return_value = None
    
    chat_engine.set_filters()
    
    assert chat_engine.filters is not None

def test_set_filters_without_filters(chat_engine):
    chat_engine.prompt_template['filters'] = "None"
    
    chat_engine.set_filters()
    
    assert chat_engine.filters is None

def test_chat(chat_engine):
    chat_engine.prompt_text = "test prompt"
    chat_engine.index_engine.index.as_chat_engine().chat.return_value = "Test response"
    
    response = chat_engine.chat("Test message", "English")
    
    assert response == "Test response"

def test_chat_cancel(chat_engine):
    chat_engine.prompt_text = "test prompt"
    chat_engine.index_engine.index.as_chat_engine().chat.return_value = "Test response"
    
    response = chat_engine.chat("Cancel message", "English")
    
    assert response == "Test response"
    assert chat_engine.step == 0