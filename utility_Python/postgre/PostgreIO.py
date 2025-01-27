#!/usr/bin/python

from config import config
from configparser import ConfigParser

from psycopg2 import Error
import psycopg2

"""
https://www.postgresqltutorial.com/postgresql-python/connect/
https://pynative.com/python-postgresql-tutorial/
"""
class PostgreIO:

    def __init__(self, cfg):
        self.cfg = cfg
        self.user = cfg['user']
        self.password = cfg['password']
        self.host = cfg['host']
        self.port = cfg['port']
        self.database = cfg['database']

        self.rowsPerInsert = 5

    def connect(self):
        """
        method get conn, cursor
        """
        try:
            conn = psycopg2.connect(
                user=self.user,
                password=self.password,
                host=self.password,
                port=self.port,
                database=self.password
                )
            cursor = conn.cursor()
            return conn, cursor
        except Exception as e:
            print ("Error while connecting to postgre", e)

    def run_sql(self, query):
        """
        method simply execute sql command
        """
        try:
            conn, cursor = self.connect()
            print (query)
            cursor.execute(query)
            conn.commit()
            print ("query OK")
        except Exception as e:
            print ("query failed", e)
        finally:
            if conn:
                cursor.close()
                conn.close()

    def create_table(self, schema, ddl):
        print (ddl)
        try:
            conn, cursor = self.connect()
            cursor.execute(ddl)
            conn.commit()
            print ("create table OK")
            return True
        except Exception as e:
            print ("create table failed", e)
            return False
        finally:
            if conn:
                cursor.close()
                conn.close()

    def insert_table(self, query):
        pass

    # https://www.py4u.net/discuss/10876
    def batch_insert_table(self, data, table_name, cols):
        sqlrows = []
        rowsPerInsert = self.rowsPerInsert
        try:
            conn, cursor = self.connect()

            for row in data:
                sqlrows += row
                if ( len(sqlrows) / len(cols) ) % rowsPerInsert == 0:
                    insertSQL = 'INSERT INTO "{table_name}" VALUES ' + ','.join(['(' + ','.join(valueSQL) + ')']*rowsPerInsert).format(table_name)
                    cur.execute(insertSQL, sqlrows)
                    conn.commit()
                    sqlrows = []
                    
            insertSQL = 'INSERT INTO "{table_name}" VALUES ' + ','.join(['(' + ','.join(valueSQL) + ')']*len(sqlrows)).format(table_name)
            cur.execute(insertSQL, sqlrows)
            conn.commit()
            print ("batch insert OK")
        except Exception as e:
            print ("batch insert failed")
        finally:
            if conn:
                cursor.close()
                conn.close()

    def update_table(self, table_name, query):
        pass

    def query_sql(self, query):
        results = []
        try:
            conn, cursor = self.connect()
            print (query)
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                results.append(row)
            print ("query sql OK")
            return results
        except Exception as e:
            print ("query sql failed", e)
        finally:
            if conn:
                cursor.close()
                conn.close()