from database.user_db import UserDatabase
from bson import ObjectId

class ConversationDatabase(UserDatabase):
    def __init__(self):
        super().__init__('user-data')
    
    def create_conversation_doc(self, collection_name, data, conversation_name):
        collection = self.db[collection_name]
        try:
            conversation_doc = {'id': 'conversation', 'name' : conversation_name, 'data': data}
            collection.insert_one(conversation_doc)
        except:
            raise Exception(f"Error creating conversation document in collection {collection_name}")
    
    def get_all_conversations(self, collection_name):
        collection = self.db[collection_name]
        try:
            conversations = collection.find({'id': 'conversation'})

            conversation_info = []
            for conversation in conversations:
                conversation_id = str(conversation['_id'])
                conversation_name = conversation.get('name', None)
                conversation_info.append({'_id': conversation_id, 'name': conversation_name})

            return conversation_info

        except Exception:
            raise Exception("Error getting previous conversations.")

    def load_conversation(self, collection_name, document_id):
        collection = self.db[collection_name]
        try:
            document_id = ObjectId(document_id)
            
            document = collection.find_one({'_id': document_id})

            if document:
                return document.get('data', None)

            return None

        except Exception as e:
            raise Exception(f"Error loading conversation: {e}")

    def delete_conversation(self, collection_name, document_id):
        collection = self.db[collection_name]
        try:

            document_id = ObjectId(document_id)

            result = collection.delete_one({'_id': document_id})

            if result.deleted_count > 0:
                return True
            else:
                raise Exception(f"Error deleting conversation: {e}")
        except Exception as e:
            raise Exception(f"Error deleting conversation: {e}")