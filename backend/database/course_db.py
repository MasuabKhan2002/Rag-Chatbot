from database.user_db import UserDatabase

class CourseDatabase(UserDatabase):
    def __init__(self, course):
        super().__init__(course)
        self.course = course
    
    def get_unique_ids(self):
        collection = self.db[self.course + "_index"]
        unique_ids = collection.distinct("id")
        return unique_ids

    def get_unique_files(self):
        collection = self.db[self.course + "_index"]
        unique_file_ids = []
        
        unique_file_names = collection.distinct("metadata.file_name")

        for file_name in unique_file_names:
            document = collection.find_one({"metadata.file_name": file_name})
            if document:
                unique_file_ids.append({
                    "file_name": file_name,
                    "id": document["id"]  # Convert ObjectId to string
                })
        transformed_file_list = self.transform_unique_ids(unique_file_ids)
        return transformed_file_list

    def transform_unique_ids(self, data):
        files_by_id = {}

        for entry in data:
            file_name = entry["file_name"]
            file_id = entry["id"]
            label = file_name.split(".")[0]

            if file_id in files_by_id:
                files_by_id[file_id]["files"].append({"label": label, "value": file_name})
            else:
                files_by_id[file_id] = {"id": file_id, "files": [{"label": label, "value": file_name}]}

        return list(files_by_id.values())