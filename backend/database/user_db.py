from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
from abc import ABC
import os

class UserDatabase(ABC):
    def __init__(self, db_name):
        self.uri = os.getenv("MONGODB_URI")
        self.client = MongoClient(self.uri, server_api=ServerApi('1'), tlsCAFile=certifi.where())
        self.db_name = db_name
        self.db = self.client[self.db_name]
    
    def create_collection(self, collection_name):
        if collection_name not in self.db.list_collection_names():
            self.db.create_collection(collection_name)
        else:
            raise Exception(f"Collection '{collection_name}' already exists in database '{self.db_name}'.")

    def upload_user_information(self, json_data, userid):
        collection = self.db[userid]
        try:
            collection.replace_one({'_id': 'user_information'}, json_data, upsert=True)
        except:
            raise Exception(f"Error updating user information for {userid}")
    
    def get_user_data(self, userid):
        collection = self.db[userid]
        try:
            document = collection.find_one({'userid': userid})
            return document
        except:
            raise Exception(f"Error getting user information for {userid}")
    
    def check_collection_exist(self, userid):
        collections = self.db.list_collection_names()
        try:
            if userid in collections:
                return True
            else:
                return False
        except:
            raise Exception(f"Error getting user information for {userid}")