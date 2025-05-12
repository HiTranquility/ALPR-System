import mysql.connector
from mysql.connector import Error
from contextlib import contextmanager
from app.utils.env import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# 🧠 Context manager để tự động đóng kết nối
@contextmanager
def get_connection():
    conn = None
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        yield conn
    finally:
        if conn and conn.is_connected():
            conn.close()

# ✅ Dùng cho INSERT, UPDATE, DELETE
def execute_non_query(query: str, params: tuple = ()):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            return True
    except Error as e:
        print("❌ execute_non_query error:", e)
        return False

# ✅ Dùng cho SELECT trả về nhiều dòng
def fetch_all(query: str, params: tuple = ()):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, params)
            return cursor.fetchall()
    except Error as e:
        print("❌ fetch_all error:", e)
        return []

# ✅ Dùng cho SELECT trả về 1 dòng duy nhất
def fetch_one(query: str, params: tuple = ()):
    try:
        with get_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(query, params)
            return cursor.fetchone()
    except Error as e:
        print("❌ fetch_one error:", e)
        return None
