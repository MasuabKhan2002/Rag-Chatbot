from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from database.index_db import IndexDatabase
from models.index_engine import IndexEngine
from models.prompt_engine import PromptEngine
from models.query_engine import QueryEngine
from database.user_db import UserDatabase
from models.chat_engine import ChatEngine
from models.question_engine import QuestionEngine
from database.conversation_db import ConversationDatabase
from models.notification_engine import NotificationEngine
from werkzeug.utils import secure_filename
import base64
from base64 import urlsafe_b64encode , b64decode
from database.admin_db import AdminDatabase
from database.course_db import CourseDatabase

import os
import os.path
import openai
import tempfile
import json

openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app, support_credentials=True)

app.config['UPLOAD_PATH'] = os.path.join('2024-ca400-khanm25-josepht2', 'src', 'backend', 'data')
app.config['UPLOAD_EXTENSIONS'] = ['jpg', 'png', 'gif', 'csv', 'docx', 'epub', 'hwp', 'ipynb', 'jpeg', 'mbox', 'md', 'mp3', 'mp4', 'pdf', 'ppt', 'pptm', 'pptx', 'text']

db = IndexDatabase()
index_engine = IndexEngine()
user_db = UserDatabase('user-data')
conversation_db = ConversationDatabase()
prompt_engine = PromptEngine(index_engine)
conversation_in_progress = False
chatbot_language = "English"
chat_engine = None
admin_database = AdminDatabase()

@app.route('/set_language', methods=['POST'])
def set_language():
    try:
        language = request.json.get("language")
        global chatbot_language
        chatbot_language = language
        return jsonify({
            "response": "Language set successfully"
        })
    except:
        return jsonify({
            "error": "error setting language"
        }), 400

@app.route('/get_notifications', methods=['POST'])
def get_notifications():
    userid = request.json.get('userid')
    time = request.json.get('time')
    user_information = user_db.get_user_data(userid)
    course = user_information['course']

    try:
        notification_engine = NotificationEngine(index_engine, course)
        notification_engine.set_filters(time)
        notifications = notification_engine.get_notifications(time)
        unique_notifications = notification_engine.remove_duplicates(notifications)
        
        return jsonify({
            "notifications": unique_notifications
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/get_conversations', methods=['POST'])
def get_conversations():
    userid = request.json.get('userid')
    try:
        conversations = conversation_db.get_all_conversations(userid)
        return jsonify({
            "conversations": conversations
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/load_conversation', methods=['POST'])
def load_conversation():
    userid = request.json.get('userid')
    document = request.json.get('document')
    try:
        data = conversation_db.load_conversation(userid, document)
        return jsonify({
            "conversation": data
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/delete_conversation', methods=['POST'])
def delete_conversation():
    userid = request.json.get('userid')
    document = request.json.get('document')
    try:
        response = conversation_db.delete_conversation(userid, document)
        if response:
           return jsonify({
            "message": "Successfully deleted conversation"
            }) 
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/save_conversation', methods=['POST'])
def save_conversation():
    userid = request.json.get('userid')
    conversation = request.json.get('conversation')
    conversation_name = request.json.get('conversation_name')
    global prompt_engine
    global conversation_in_progress
    global chat_engine
    try:
        if conversation_name is None or conversation_name.strip() == '':
            conversation_name = prompt_engine.name_conversation()
        conversation_db.create_conversation_doc(userid, conversation, conversation_name)
        prompt_engine = PromptEngine(index_engine)
        chat_engine = None
        conversation_in_progress = False
        return jsonify({
            "message": "Saved Conversation"
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/first_time_sign_in', methods=['POST'])
def first_time_sign_in():
    userid = request.json.get('userid')
    try:
        user_db.create_collection(userid)
        user_db.upload_user_information(request.json, userid)
        db.add_nodes_from_json(request.json, 'user_index', 'user_index', 'user_index', userid)
        return jsonify({
            "message": f"Successfully created user profile."
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/check_sign_in', methods=['POST'])
def check_sign_in():
    userid = request.json.get('userid')
    try:
        if user_db.check_collection_exist(userid):
            return jsonify({
                "message": f"True"
            })
        else:
            return jsonify({
                "message": f"False"
            })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/upload_index', methods=['POST'])
@cross_origin(supports_credentials=True)
def upload_index():
    try:
        db_name = request.json.get('db')
        collection = request.json.get('collection')
        type = request.json.get('type')
        index_name = request.json.get('index')
        path = request.json.get('path')
        id = request.json.get('id')
        final_path = path
        if isinstance(path, dict):
            data_string = path.get('data').split(",")[0]
            upload_extensions = app.config['UPLOAD_EXTENSIONS']
            extension_found = any(extension in data_string for extension in upload_extensions)
            if extension_found:
                upload_method = request.json.get('upload_method')
                base64string = path.get('data').split(",")[1]
                bytes = b64decode(base64string, validate=True)
                file_name = path.get('name')
                if upload_method == 'dir':
                    directory_name = os.path.join(app.config['UPLOAD_PATH'], db_name, id, path.get('directory'))
                    os.makedirs(directory_name, exist_ok=True)
                    final_path = os.path.join(directory_name, file_name)
                
                if upload_method == 'file':
                    final_path = os.path.join(app.config['UPLOAD_PATH'], db_name, id, file_name)    
                    os.makedirs(os.path.dirname(final_path), exist_ok=True)


                with open(final_path, 'wb') as file:
                    file.write(bytes)
        db.add_nodes(final_path, db_name, collection, index_name, id, type)
        return jsonify({"message": "File data received and saved successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/query', methods=['POST'])
def query():
    try:
        global conversation_in_progress
        global chat_engine
        global prompt_engine
        global chatbot_language
        userid = request.json.get('userid')
        message = request.json.get('message')
        user_information = user_db.get_user_data(userid)
        course = user_information['course']

        if conversation_in_progress is False:
            prompt_engine.match_prompt(message)
            prompt_engine.set_prompt_placeholders(course, userid)
            if prompt_engine.prompt_template["type"] == "query":
                query_engine = QueryEngine(index_engine, prompt_engine.prompt_template, message, chatbot_language)
                query_engine.set_filters()
                response = query_engine.query()
                return response
            elif prompt_engine.prompt_template['type'] == 'chat':
                conversation_in_progress = True
                chat_engine = ChatEngine(index_engine, prompt_engine.prompt_template, course)
                chat_engine.set_filters()
                chat_engine.prompt_step(message)
                response = chat_engine.chat(message, chatbot_language)
                return response
        else:
            chat_engine.prompt_step(message)
            response = chat_engine.chat(message, chatbot_language)
            if message == prompt_engine.prompt_template["cancel_message"]:
                conversation_in_progress = False
                chat_engine.step = 0
            return response
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/questions', methods=['GET'])
def get_questions():
    try:
        global prompt_engine
        global conversation_in_progress
        global chat_engine
        question_engine = QuestionEngine(index_engine)
        questions = []

        if conversation_in_progress is False:
            questions = question_engine.get_all_questions()[:3]
            return jsonify(questions)
        else:
            questions = question_engine.get_condition_question(prompt_engine.prompt_template, chat_engine)[:2]
            questions.append({"Type": "cancel message", "Text": prompt_engine.prompt_template["cancel_message"]})
            return jsonify(questions)
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/delete_node',  methods=['POST'])
def delete_node():
    try:
        db_name = request.json.get('db')
        collection = request.json.get('collection')
        index_name = request.json.get('index')
        doc = request.json.get('doc')

        index_engine.delete_doc_from_index(db_name, collection, index_name, doc)
        return jsonify({
                "message": f"Succesfully deleted node from index"
            })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/admin/check_sign_in', methods=['POST'])
def admin_check_sign_in():
    userid = request.json.get('userid')
    try:
        if admin_database.check_collection_exist(userid):
            return jsonify({
                "message": f"True"
            })
        else:
            return jsonify({
                "message": f"False"
            })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

@app.route('/admin/first_time_sign_in', methods=['POST'])
def admin_first_time_sign_in():
    userid = request.json.get('userid')
    passkey = request.json.get('passkey')
    try:
        if passkey == "adminPasskey123":
            admin_database.create_collection(userid)
            json_data = request.json.copy()
            json_data.pop('passkey', None)
            admin_database.upload_user_information(json_data, userid)
            return jsonify({
                "message": f"Successfully created admin profile."
            })
        else:
            raise Exception("Invalid passkey")
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400
    
@app.route('/admin/get_unique_files', methods=['POST'])
def admin_get_unique_files():
    try:
        userid = request.json.get('userid')
        user_info = admin_database.get_user_data(userid)
        course = request.json.get('course')
        
        unique_files = CourseDatabase(course).get_unique_files()
        return unique_files
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True)