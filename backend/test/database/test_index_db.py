import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, src_dir)

import pytest
from unittest.mock import MagicMock, patch
from database.index_db import IndexDatabase, MongoDBAtlasVectorSearch

@pytest.fixture(scope="session")
def index_database():
    index_db = IndexDatabase()
    index_db.client = MagicMock()
    index_db.embed_model = MagicMock()
    return index_db

@pytest.fixture
def mock_nodes():
    mock_node1 = MagicMock(name="node1")
    mock_node1.content = "Content"
    mock_node1.id_ = ""
    mock_node1.embedding = None

    mock_node2 = MagicMock(name="node2")
    mock_node2.content = "Content"
    mock_node2.id_ = ""
    mock_node2.embedding = None

    return [mock_node1, mock_node2]

def test_nodes_from_file(index_database, mock_nodes):
    path = "path/to/file"
    db_name = "test_db"
    collection_name = "test_collection"
    index_name = "test_index"
    id = "test_id"

    with patch("database.index_db.SimpleDirectoryReader"), \
         patch("database.index_db.SimpleNodeParser") as mock_node_parser, \
         patch("database.index_db.MongoDBAtlasVectorSearch"):

        mock_node_parser.return_value.get_nodes_from_documents.return_value = mock_nodes

        index_database.embed_model.return_value = [1,2,3]

        index_database.add_nodes(path, db_name, collection_name, index_name, id, "file")

        for node in mock_nodes:
            assert hasattr(node, 'id_')
            assert getattr(node, 'id_') == id 

            assert hasattr(node, 'embedding')
            assert getattr(node, 'embedding') is not None
    
def test_add_nodes_from_directory(index_database, mock_nodes):
    path = "/path/to/directory"
    db_name = "test_db"
    collection_name = "test_collection"
    index_name = "test_index"
    id = "test_id"

    with patch("database.index_db.SimpleDirectoryReader"), \
         patch("database.index_db.SimpleNodeParser") as mock_node_parser, \
         patch("database.index_db.MongoDBAtlasVectorSearch"):

        mock_node_parser.return_value.get_nodes_from_documents.return_value = mock_nodes

        index_database.embed_model.return_value = [1,2,3]

        index_database.add_nodes(path, db_name, collection_name, index_name, id, "dir")

        for node in mock_nodes:
            assert hasattr(node, 'id_')
            assert getattr(node, 'id_') == id 

            assert hasattr(node, 'embedding')
            assert getattr(node, 'embedding') is not None

def test_add_nodes_error_handling(index_database):
    path = "/path/to/invalid/directory"
    db_name = "test_db"
    collection_name = "test_collection"
    index_name = "test_index"
    id = "test_id"

    with patch("database.index_db.SimpleDirectoryReader") as mock_directory_reader, \
         patch("database.index_db.SimpleNodeParser") as mock_node_parser, \
         patch("database.index_db.MongoDBAtlasVectorSearch") as mock_vector_search:

        mock_directory_reader.return_value.load_data.side_effect = Exception("Invalid directory")

        with pytest.raises(Exception) as exc_info:
            index_database.add_nodes(path, db_name, collection_name, index_name, id, "dir")
        
        assert str(exc_info.value) == "Error adding nodes"
        
        assert not mock_node_parser.return_value.get_nodes_from_documents.called
        assert not mock_vector_search.return_value.add.called

def test_add_nodes_from_json(index_database, mock_nodes):
    jsonData = {"test-data": "test-data"}
    db_name = "test_db"
    collection_name = "test_collection"
    index_name = "test_index"
    id = "test_id"

    mock_db = []

    def check_file_exist(input_files):
        return os.path.exists(input_files[0])
    
    def add_side_effect(nodes):
        for node in nodes:
            mock_db.append(node.id_)

    with patch("database.index_db.SimpleDirectoryReader") as mock_reader, \
         patch("database.index_db.SimpleNodeParser") as mock_node_parser, \
         patch("database.index_db.MongoDBAtlasVectorSearch") as mock_vector_search:
        
        # test to make sure docs are being added to db
        mock_vector_search_instance = MagicMock(spec=MongoDBAtlasVectorSearch)
        mock_vector_search_instance.documents = mock_db
        mock_vector_search_instance.add.side_effect = add_side_effect
        mock_vector_search.return_value = mock_vector_search_instance

        # Test if file path exists
        mock_reader_instance = MagicMock()

        def mock_side_effect(input_files):
            mock_reader_instance.file_path = check_file_exist(input_files)
            return mock_reader_instance
        
        mock_reader.side_effect = mock_side_effect

        # test if node has embedding and id_
        mock_node_parser.return_value.get_nodes_from_documents.return_value = mock_nodes

        index_database.embed_model.return_value = [1,2,3]

        index_database.add_nodes_from_json(jsonData, db_name, collection_name, index_name, id)

        assert len(mock_db) == 2

        assert mock_reader_instance.file_path == True

        for node in mock_nodes:
            assert hasattr(node, 'id_')
            assert getattr(node, 'id_') == id 

            assert hasattr(node, 'embedding')
            assert getattr(node, 'embedding') is not None

        # test to make sure temp file is deleted
        assert check_file_exist("json_data.txt") is False