import json
from llama_index.core.memory import ChatMemoryBuffer

class PromptEngine():
    def __init__(self, index_engine):
        self.index_engine = index_engine
        self.prompt_template = None
        self.memory = ChatMemoryBuffer.from_defaults()
        self.prompt =(
            "Context information is below.\n"
            "---------------------\n"
            "{context_str}\n"
            "---------------------\n"
            "Given the context information"
            "Find the most relevant prompt for the following message from the user: {query_str}\n"
            "The response should be the text from the chosen file in json format\n"
            "The response MUST RETAIN ALL INFORMATION AND NOTHING SHOULD BE CHANGED OR MODIFIED\n"
        )

    def name_conversation(self):
        self.index_engine.load_index('prompts', 'prompts_index', 'prompts_index')
        naming_prompt = (
            "Find the most relevant name for the conversation based on the chat history\n"
            "Keep the name to only a few words and only return the name.\n")
        query = "Name the conversation"
        conversation_naming_engine = self.index_engine.index.as_chat_engine(system_prompt=naming_prompt, chat_mode="context", memory=self.memory)
        conversation_name = conversation_naming_engine.chat(query)
        return conversation_name.response
    
    def set_prompt_placeholders(self, course, userid):
        placeholders_to_replace = {
            "index": "course_index",
            "db": course,
            "collection": course + "_index",
            "filters": userid
        }
        if self.prompt_template:
            for key, value in placeholders_to_replace.items():
                if key in self.prompt_template and self.prompt_template[key] == key:
                    self.prompt_template[key] = value

    def match_prompt(self, message):
        self.index_engine.load_index('prompts', 'prompts_index', 'prompts_index')
        prompt_selection_engine = self.index_engine.index.as_chat_engine(system_prompt=self.prompt, chat_mode="context", memory=self.memory)
        prompts = prompt_selection_engine.chat(message)
        try:
            prompt_json = json.loads(prompts.response)
        except json.decoder.JSONDecodeError as e:
            print("Error decoding JSON:", e)
        
        self.prompt_template = prompt_json
        