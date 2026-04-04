#!/usr/bin/env python3
"""Simple dev server for ICF Registry. Serves on IPv6 (::1) which Chrome prefers."""
import http.server
import socketserver
import socket
import os

PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
    }

class IPv6Server(socketserver.TCPServer):
    allow_reuse_address = True
    address_family = socket.AF_INET6

with IPv6Server(('::1', PORT), Handler) as httpd:
    print(f'Serving at http://localhost:{PORT} (IPv6)')
    print(f'Open http://localhost:{PORT}/public/embed-example.html')
    httpd.serve_forever()
