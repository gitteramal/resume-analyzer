import pyodbc
import os

def get_db_connection():
    conn_str = os.getenv("SQL_CONNECTION_STRING")
    if not conn_str:
        raise Exception("SQL_CONNECTION_STRING not set")
    return pyodbc.connect(conn_str)
