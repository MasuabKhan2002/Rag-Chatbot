from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter
from database.course_db import CourseDatabase
import random

class ChatEngine():
    def __init__(self, index, prompt, course):
        self.index_engine = index
        self.prompt_template = prompt
        self.course = course
        self.prompt_text = None
        self.filters = None
        self.memory = ChatMemoryBuffer.from_defaults()
        self.step = 0

    def find_item_in_list(self, string, lst):
        return next((item for item in lst if item == string), None)
    
    def get_modules(self):
        modules = CourseDatabase(self.course).get_unique_ids()
        random.shuffle(modules)
        return modules
    
    def prompt_step(self, message):
        for step in self.prompt_template['steps']:
            if step["id"] == self.step:
                if step["query_condition"] == "None":
                    self.prompt_text = step["message"]
                    self.step = self.step + 1
                    break
                elif isinstance(step["query_condition"], list):
                    item = self.find_item_in_list(message, step["query_condition"])
                    if item is not None:
                        self.filters = MetadataFilters(
                            filters=[ExactMatchFilter(key="id", value=item)])
                        self.prompt_text = step["message"]
                        self.step = self.step + 1
                    break
                elif step["query_condition"] == "modules":
                    modules = self.get_modules()
                    item = self.find_item_in_list(message, modules)
                    if item is not None:
                        self.filters = MetadataFilters(
                            filters=[ExactMatchFilter(key="id", value=item)])
                        self.prompt_text = step["message"]
                        self.step = self.step + 1
                    break
        
    def set_filters(self):
        try:
            self.index_engine.load_index(self.prompt_template['db'], self.prompt_template['collection'], self.prompt_template['index'])
            if self.prompt_template['filters'] != "None":
                self.filters = MetadataFilters(
                    filters=[ExactMatchFilter(key="id", value=self.prompt_template['filters'])])
        except:
            raise Exception(f"Error creating filters")

    def chat(self, message, language):
        chat_engine = self.index_engine.index.as_chat_engine(system_prompt=self.prompt_text + "\nreturn response in " + language, filters=self.filters, chat_mode="context", memory=self.memory)
        response = chat_engine.chat(message)
        if message == self.prompt_template["cancel_message"]:
                chat_engine.reset()
        return str(response)