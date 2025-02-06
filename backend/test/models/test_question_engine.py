import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock
from models.question_engine import QuestionEngine

@pytest.fixture
def question_engine():
    index_engine = MagicMock()
    index_engine.load_index.return_value = "index"

    return QuestionEngine(index_engine)

def test_init(question_engine):
    assert question_engine.index_engine.load_index.return_value == "index"
    assert question_engine.prompt_nodes is None
    assert question_engine.question_list == []

def test_get_all_questions(question_engine):

    question_engine.index_engine.load_index.return_value = None
    question_engine.index_engine.index.as_retriever.return_value = MagicMock()
    question_engine.index_engine.index.as_retriever().retrieve.return_value = [
        MagicMock(node=MagicMock(text='{"name": "prompt1", "type": "type1", "questions": ["Question1", "Question2"]}')),
        MagicMock(node=MagicMock(text='{"name": "prompt2", "type": "type2", "questions": ["Question3"]}')),
    ]
    
    questions = question_engine.get_all_questions()
    
    assert len(questions) == 2
    assert all(isinstance(q, dict) for q in questions)
    assert all("Type" in q and "Text" in q for q in questions)

def test_get_condition_question(question_engine):
    prompt = {
        'steps': [
            {'id': 1, 'query_condition': ['Condition1', 'Condition2']},
            {'id': 2, 'query_condition': 'modules'}
        ]
    }
    chat_engine_mock = MagicMock()
    chat_engine_mock.step = 1
    chat_engine_mock.get_modules.return_value = ['Module1', 'Module2']
    
    condition_questions = question_engine.get_condition_question(prompt, chat_engine_mock)
    
    assert len(condition_questions) == 2
    assert all(isinstance(q, dict) for q in condition_questions)
    assert all("Type" in q and "Text" in q for q in condition_questions)

def test_get_condition_question_no_steps(question_engine):
    prompt = {'steps': []}
    chat_engine_mock = MagicMock()
    
    condition_questions = question_engine.get_condition_question(prompt, chat_engine_mock)
    
    assert condition_questions == []

def test_get_condition_question_step_id_not_matching(question_engine):
    prompt = {'steps': [{'id': 1, 'query_condition': 'Condition'}]}
    chat_engine_mock = MagicMock()
    chat_engine_mock.step = 2
    
    condition_questions = question_engine.get_condition_question(prompt, chat_engine_mock)
    
    assert condition_questions == []

def test_get_condition_question_query_condition_none(question_engine):
    prompt = {'steps': [{'id': 1, 'query_condition': "None"}]}
    chat_engine_mock = MagicMock()
    
    condition_questions = question_engine.get_condition_question(prompt, chat_engine_mock)
    
    assert condition_questions == []