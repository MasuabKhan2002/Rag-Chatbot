from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter

class NotificationEngine():
    def __init__(self, index_engine, course):
        self.index_engine = index_engine
        self.filters = None
        self.course = course
    
    def set_filters(self, creation_date):
        try:
            self.filters = MetadataFilters(
                filters=[ExactMatchFilter(key="metadata.creation_date", value=creation_date)])
        except:
            raise Exception(f"Error creating filters")

    def remove_duplicates(self, notifications):
        unique_notifications = {}
        for notification in notifications:
            course = notification["course"]
            name = notification["name"]
            if course not in unique_notifications:
                unique_notifications[course] = {"course": course, "files": []}
            if name not in unique_notifications[course]["files"]:
                unique_notifications[course]["files"].append(name)
        return list(unique_notifications.values())

    def get_notifications(self, creation_date):
        try:
            self.index_engine.load_index(self.course, self.course + "_index", "course_index")
            length_of_collections = self.index_engine.vector_store._collection.count_documents({"metadata.creation_date": creation_date})
            if (length_of_collections == 0):
                length_of_collections = 1
            retriever = self.index_engine.index.as_retriever(similarity_top_k=length_of_collections, filters=self.filters)
            source_nodes = retriever.retrieve("get all nodes")

            notifications = []

            for node in source_nodes:
                notifications.append({"name" : node.metadata.get('file_name'), "course": node.id_})
            
            return notifications

        except Exception:
            raise Exception(f"Error getting Notifications")
