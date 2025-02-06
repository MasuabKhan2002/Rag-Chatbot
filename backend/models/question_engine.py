import json
import random

class QuestionEngine():
    def __init__(self, index_engine):
        self.index_engine = index_engine
        self.prompt_nodes = None
        self.question_list = []

    def get_all_questions(self):
        self.index_engine.load_index('prompts', 'prompts_index', 'prompts_index')
        length_of_collections = self.index_engine.vector_store._collection.count_documents({})
        retriever = self.index_engine.index.as_retriever(similarity_top_k=length_of_collections)
        source_nodes = retriever.retrieve("get all nodes")

        random.shuffle(source_nodes)

        for node in source_nodes:
            json_text = json.loads(node.node.text)
            if json_text['name'] != "greeting_prompt":
                questions = json_text["questions"]
                random_question = random.choice(questions)
                self.question_list.append({"Type" : json_text["type"], "Text" : random_question})

        return self.question_list

    def get_condition_question(self, prompt, chat_engine):
        condition_questions = []
        for step in prompt['steps']:
            if step["id"] == chat_engine.step:
                query_condition = step["query_condition"]
                if isinstance(query_condition, str) and query_condition == "None":
                    return condition_questions
                elif isinstance(query_condition, list):
                    for condition in query_condition:
                        condition_questions.append({"Type": "Chat", "Text": condition})
                    return condition_questions
                elif query_condition == "modules":
                    modules = chat_engine.get_modules()
                    for condition in modules:
                        condition_questions.append({"Type": "Chat", "Text": condition})
                    return condition_questions
        return condition_questions