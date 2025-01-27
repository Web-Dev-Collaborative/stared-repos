# python 3

import socket
from _thread import *
import threading

"""
CLIENT V3 : consider scalability (multi thread + file IO enhancement)

- Ideas
    - multi thread
        - https://www.geeksforgeeks.org/socket-programming-multi-threading-python/
    - async
    - file IO enhancement

1) Ref
Sockets are byte streams, not message streams
http://stupidpythonideas.blogspot.com/2013/05/sockets-are-byte-streams-not-message.html

https://stackoverflow.com/questions/17667903/python-socket-receive-large-amount-of-data

2) Commands
python server.py

4) QA 
plz use below curl commands send data via CLI
curl -d "param1=value1&param2=value2" -X POST http://localhost:9999
curl -d "123123" -X POST http://localhost:9999
curl -d "HELLO WORLD" -X POST http://localhost:9999

5) clear app using port
lsof -i tcp:<port> 
"""

class Server:

    def __init__(self):

        self.host = '127.0.0.1'
        self.port = 9999

        # define recv_bufsize, so we can really receive and cut off on each incoming event
        self.recv_bufsize = 1024

        self.print_lock = threading.Lock()

    def threaded(self, conn):
        
        while True:

            clientMessage = str(conn.recv(self.recv_bufsize), encoding='utf-8')
            print ("thread id :", threading.current_thread().name)
            self.print_lock.release()

            break

        conn.close()

    def run(self):

        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.bind((self.host, self.port))
        server.listen(5)

        while True:
            conn, addr = server.accept()
            """
            https://docs.python.org/3/library/socket.html

            socket.recv(bufsize[, flags])
            Receive data from the socket. 
            The return value is a bytes object representing the data received. 
            The maximum amount of data to be received at once is specified by bufsize. 
            """

            # get lock
            self.print_lock.acquire()
            start_new_thread(self.threaded, (conn,))

            clientMessage = str(conn.recv(self.recv_bufsize), encoding='utf-8')
            print(clientMessage)

            # save to file
            """
            https://www.w3schools.com/python/python_file_write.asp

            "a" - Append - will append to the end of the file
            "w" - Write - will overwrite any existing content
            """
            with open('output.txt', 'a') as f:
                f.write(clientMessage)

        server.close()

if __name__ == '__main__':
    s = Server()
    s.run()