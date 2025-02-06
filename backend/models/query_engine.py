from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter
from llama_index.core import PromptTemplate

class QueryEngine():
    def __init__(self, index, prompt, message, language):
        self.index_engine = index
        self.prompt_template = prompt
        self.prompt_text = PromptTemplate(self.prompt_template["text"] + "\n return response in " + language)
        self.message = message
        self.filters = None

    def set_filters(self):
        try:
            if self.prompt_template['filters'] != "None":
                self.filters = MetadataFilters(
                    filters=[ExactMatchFilter(key="id", value=self.prompt_template['filters'])])
        except:
            raise Exception(f"Error creating filters")
    
    def query(self):
        self.index_engine.load_index(self.prompt_template['db'], self.prompt_template['collection'], self.prompt_template['index'])
        query_engine = self.index_engine.index.as_query_engine(text_qa_template=self.prompt_text, filters=self.filters)
        response = query_engine.query(self.message)
        return str(response)