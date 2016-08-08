import http.server
import socketserver
import os

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

httpd = socketserver.TCPServer(("", PORT), Handler)

print("serving at port ", PORT)

print("Opening Page...")
os.system("start \"\" http://localhost:8000")


httpd.serve_forever()
