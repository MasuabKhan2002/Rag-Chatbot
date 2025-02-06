import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock
from models.query_engine import QueryEngine
from models.query_engine import PromptTemplate

@pytest.fixture
def query_engine():
    index_engine = MagicMock()
    index_engine.load_index.return_value = "index"
    prompt_template = {
        'db': 'test_db',
        'collection': 'test_collection',
        'index': 'test_index',
        'text': 'Test prompt text',
        'filters': 'test_filters'
    }
    return QueryEngine(index_engine, prompt_template, "Test message", "English")

def test_init(query_engine):
    assert query_engine.index_engine.load_index.return_value == "index"
    assert query_engine.prompt_template == {
        'db': 'test_db',
        'collection': 'test_collection',
        'index': 'test_index',
        'text': 'Test prompt text',
        'filters': 'test_filters'
    }
    assert query_engine.prompt_text == PromptTemplate("Test prompt text\n return response in English")
    assert query_engine.message == "Test message"
    assert query_engine.filters is None

def test_set_filters_with_filters(query_engine):
    query_engine.index_engine.load_index.return_value = None
    
    query_engine.set_filters()
    
    assert query_engine.filters is not None

def test_set_filters_without_filters(query_engine):
    query_engine.prompt_template['filters'] = "None"
    
    query_engine.set_filters()

    assert query_engine.filters is None

def test_query(query_engine):
    query_engine.index_engine.index.as_query_engine().query.return_value = "Test response"
    
    response = query_engine.query()
    
    assert response == "Test response"

def test_query_error(query_engine):
    query_engine.index_engine.index.as_query_engine().query.side_effect = Exception("Query error")
    
    with pytest.raises(Exception, match="Query error"):
        query_engine.query()
