import socketserver

class BusUDPHandler(socketserver.BaseRequestHandler):
    def setup(self):
        self.shared_data = self.server.shared_data

    def buildPacket(self, bus):
        flags = 0
        if bus['IsDelayed'] == True:
            flags |= 0x01
        if bus['IsOnRoute'] == True:
            flags |= 0x02
        return struct.pack('!BBHHHfff', 
            flags,
            bus['Seconds'],
            bus['Heading'],
            bus['RouteID'],
            bus['VehicleID'],
            bus['Latitude'],
            bus['Longitude'],
            bus['GroundSpeed'])
    def handle(self):
        data = self.request[0].strip()
        #data = int(data)
        socket = self.request[1]
        print("{} wrote:".format(self.client_address[0]))
        print(int(data[-1]))
        try:
            socket.sendto(b'1', self.client_address)
            for bus in self.shared_data['locations']:
                print("in loop")
                if bus['VehicleID'] == int(data[-1]):
                    socket.sendto(self.buildPacket(bus), self.client_address)
                else:
                    print('failed')
        except:
            print("User reqested VehicleID that does not exist")

    def setSharedDataSource(self, shared_data):
        self.shared_data = shared_data

class BusUDPServer(socketserver.ThreadingUDPServer):
    def __init__(self, host_port, handler, shared_data):
        super(BusUDPServer, self).__init__(host_port, handler)
        self.shared_data = shared_data
    
#    def process_request(self, request, client_address)
#        # copied from
#        # https://hg.python.org/cpython/file/3.4/Lib/socketserver.py
#        # Look into doing this without copy-paste...
#        try:
#            self.finish_request(request, client_address, self.shared_data)
#            self.shutdown_request(request)
#        except:
#            self.handle_error(request,
#            client_address)
#            self.shutdown_request(request)

if __name__ == "__main__":
    HOST, PORT = "localhost", 6269
    socketserver.UDPServer((HOST, PORT), BusUDPHandler).serve_forever()
