import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock, patch
from models.index_engine import IndexEngine
from models.index_engine import Settings

@pytest.fixture(scope="session")
def index_engine():
    conversation_db = IndexEngine()
    conversation_db.db = MagicMock()

    return conversation_db

@pytest.fixture
def mock_node():
    # Mock a node object with relationships
    mock_node = MagicMock()
    relationship_id = "relationship_1"
    node_id = "node_1"
    mock_relationship = MagicMock()
    mock_relationship.node_id = node_id
    mock_node.node.relationships = {relationship_id: mock_relationship, "relationship2": mock_relationship}

    return mock_node

def test_init(index_engine):
    assert index_engine.model == "gpt-3.5-turbo"
    assert index_engine.vector_store is None
    assert index_engine.index is None
    assert Settings.llm.temperature == 0
    assert Settings.llm.model == "gpt-3.5-turbo"
    assert Settings.chunk_size == 5120

def test_load_index_success(index_engine):
    with patch("models.index_engine.MongoDBAtlasVectorSearch") as mock_vector_search:
        mock_vector_store = MagicMock()
        mock_vector_search.return_value = mock_vector_store
        
        index_engine.load_index("db", "collection", "index")
        
        assert index_engine.vector_store == mock_vector_store
        assert index_engine.index is not None

def test_load_index_failure(index_engine):
    with patch("models.index_engine.MongoDBAtlasVectorSearch") as mock_vector_search:
        mock_vector_search.side_effect = Exception("Mocked exception")
        
        with pytest.raises(Exception):
            index_engine.load_index("db", "collection", "index")
            assert Exception == f"error loading index: index"

def test_delete_doc_from_index_success(index_engine, mock_node):
    with patch("models.index_engine.MongoDBAtlasVectorSearch") as mock_vector_search,\
         patch("models.index_engine.VectorStoreIndex.from_vector_store") as mock_vector_index:
        mock_vector = MagicMock()
        mock_vector_search.return_value = mock_vector
        mock_vector_store = MagicMock()
        mock_vector_index.return_value = mock_vector_store

        mock_vector._collection.count_documents.return_value = 1

        mock_vector_store.as_retriever.return_value.retrieve.return_value = [mock_node]

        index_engine.delete_doc_from_index("db", "collection", "index", "test_filename")

        mock_vector._collection.count_documents.assert_called_once_with({"metadata.file_name": "test_filename"})

        mock_vector.delete.assert_called_once_with("node_1")