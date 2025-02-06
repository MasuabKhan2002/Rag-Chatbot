import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock, patch
from models.prompt_engine import PromptEngine

@pytest.fixture
def prompt_engine():
    index_engine = MagicMock()
    index_engine.load_index.return_value = "index"

    return PromptEngine(index_engine)

def test_init(prompt_engine):
    assert prompt_engine.index_engine.load_index.return_value == "index"
    assert prompt_engine.prompt_template is None
    assert prompt_engine.memory is not None

def test_name_conversation(prompt_engine):
    prompt_engine.index_engine.load_index.return_value = None
    prompt_engine.index_engine.index.as_chat_engine().chat.return_value.response = "Conversation Name"
    
    result = prompt_engine.name_conversation()
    
    assert result == "Conversation Name"

def test_set_prompt_placeholders(prompt_engine):
    prompt_engine.prompt_template = {
        "index": "index",
        "db": "db",
        "collection": "collection",
        "filters": "filters"
    }
    
    prompt_engine.set_prompt_placeholders("new_course", "new_userid")
    
    assert prompt_engine.prompt_template["db"] == "new_course"
    assert prompt_engine.prompt_template["collection"] == "new_course_index"
    assert prompt_engine.prompt_template["filters"] == "new_userid"

def test_match_prompt(prompt_engine):
    prompt_engine.index_engine.load_index.return_value = None
    prompt_engine.index_engine.index.as_chat_engine().chat.return_value.response = '{"index": "course_index", "db": "example_course"}'
    
    prompt_engine.match_prompt("Sample message")
    
    assert prompt_engine.prompt_template == {"index": "course_index", "db": "example_course"}