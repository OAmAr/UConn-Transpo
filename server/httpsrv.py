import socketserver
import http.server

class BusHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def __init__(self, request, client_address, server):
        super(BusHTTPRequestHandler, self).__init__(request, client_address,
        server)
    
    def setup(self):
        super(BusHTTPRequestHandler, self).setup()
        self.shared_data = self.server.shared_data

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        responsestr = ""
        if self.path == '/vehicles':
            for bus in self.shared_data['locations']:
                responsestr += str(bus['VehicleID']) + "\n"
        elif self.path[0:8] == '/search/':
            # call search algorithm
            args = self.path.split('/')
            try:
                pass # call search algo
                responsestr = "tmp" # set to result of search algorithm
            except:
                responsestr = "Search Failed"
        else:
            responsestr = self.path
        self.wfile.write(bytes(responsestr, 'UTF-8'))

class BusHTTPServer(http.server.HTTPServer):
    def __init__(self, host_port, handler, shared_data):
        super(BusHTTPServer, self).__init__(host_port, handler)
        self.shared_data = shared_data
 
if __name__ == "__main__":
    PORT = 8000
    Handler = BusHTTPRequestHandler
    httpd = BusHTTPServer(("", PORT), Handler, "non_real_shared_data")
    print("serving at port", PORT)
    httpd.serve_forever()
