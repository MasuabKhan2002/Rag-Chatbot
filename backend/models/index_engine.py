from database.index_db import IndexDatabase
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from llama_index.core import VectorStoreIndex
from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter

class IndexEngine(IndexDatabase):
    def __init__(self):
        super().__init__()
        self.model = "gpt-3.5-turbo"
        Settings.llm = OpenAI(temperature=0, model=self.model)
        Settings.chunk_size = 5120
        self.vector_store = None
        self.index = None

    def load_index(self, db, collection, index):
        try:
            vector_store = MongoDBAtlasVectorSearch(
                self.client,
                db_name=db,
                collection_name=collection,
                index_name=index
            )
            self.vector_store = vector_store
            self.index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
        except:
            raise Exception(f"error loading index: {index}")

    def delete_doc_from_index(self, db, collection, index, filename):
        try:
            vector_store = MongoDBAtlasVectorSearch(
                self.client,
                db_name=db,
                collection_name=collection,
                index_name=index
            )
            self.index = VectorStoreIndex.from_vector_store(vector_store=vector_store)

            filters = MetadataFilters(filters=[ExactMatchFilter(key="metadata.file_name", value=filename)])
            length_of_collections = vector_store._collection.count_documents({"metadata.file_name": filename})

            if length_of_collections == 0:
                raise Exception("File not found")
                
            retriever = self.index.as_retriever(similarity_top_k=length_of_collections, filters=filters)
            source_nodes = retriever.retrieve("get all nodes")

            for node in source_nodes:
                doc_ref_id = (node.node.relationships[next(iter(node.node.relationships))]).node_id
                vector_store.delete(doc_ref_id)

        except Exception as e:
            raise Exception(f"error deleting doc: {e}")