from database.user_db import UserDatabase

class AdminDatabase(UserDatabase):
    def __init__(self):
        super().__init__('admin-database')