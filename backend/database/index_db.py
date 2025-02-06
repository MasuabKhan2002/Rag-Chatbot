from abc import ABC
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
from llama_index.core import Settings
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from llama_index.core.node_parser import JSONNodeParser
from llama_index.readers.file import FlatReader
from pathlib import Path
import os

class IndexDatabase(ABC):
    def __init__(self):
        self.uri = os.getenv("MONGODB_URI")
        self.client = MongoClient(self.uri, server_api=ServerApi('1'), tlsCAFile=certifi.where())
        self.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
        Settings.embed_model = self.embed_model

    def add_nodes(self, path, db_name, collection_name, index_name, id, type):
        try:
            if type == 'file':
                reader = SimpleDirectoryReader(input_files=[path])
                data = reader.load_data()
                nodes = SimpleNodeParser().get_nodes_from_documents(data)
            elif type == 'dir':
                reader = SimpleDirectoryReader(input_dir=path)
                data = reader.load_data()
                nodes = SimpleNodeParser().get_nodes_from_documents(data)
            elif type == 'nested_dir':
                reader = SimpleDirectoryReader(input_dir=path, recursive=True)
                data = reader.load_data()
                nodes = SimpleNodeParser().get_nodes_from_documents(data)
            elif type == 'json_file':
                documents = FlatReader().load_data(Path(path))
                parser = JSONNodeParser()
                nodes = parser.get_nodes_from_documents(documents)
            
            for node in nodes:
                if id is not None and id != "":
                    node.id_ = id
                node_embedding = self.embed_model.get_text_embedding(
                    node.get_content(metadata_mode="all")
                )
                node.embedding = node_embedding
            
            vector_store = MongoDBAtlasVectorSearch(
                self.client,
                db_name=db_name,
                collection_name=collection_name,
                index_name=index_name,
            )
            vector_store.add(nodes)
        except Exception as e:
            raise Exception(f"Error adding nodes")

    def store_json_data(self, data):
        filename = "json_data.txt"
        with open(filename, "w") as file:
            file.write(str(data))
    
    def delete_json_file(self):
        filename = "json_data.txt"
        if os.path.exists(filename):
            os.remove(filename)

    def add_nodes_from_json(self, jsonData, db, collection, index, id):
        try:
            self.store_json_data(jsonData)
            reader = SimpleDirectoryReader(input_files=['json_data.txt'])
            data = reader.load_data()
            nodes = SimpleNodeParser().get_nodes_from_documents(data)
            for node in nodes:
                if id is not None and id != "":
                    node.id_ = id
                node_embedding = self.embed_model.get_text_embedding(
                    node.get_content(metadata_mode="all")
                )
                node.embedding = node_embedding
            
            vector_store = MongoDBAtlasVectorSearch(
                self.client,
                db_name=db,
                collection_name=collection,
                index_name=index,
            )
            vector_store.add(nodes)
            self.delete_json_file()
        except:
            raise Exception(f"Error adding nodes")