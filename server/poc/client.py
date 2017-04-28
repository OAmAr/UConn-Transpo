import socket
import sys
import struct

HOST, PORT = "cam-dorm.tk", 6269
data = 46

# SOCK_DGRAM is the socket type to use for UDP sockets
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# As you can see, there is no connect() call; UDP has no connections.
# Instead, data is directly sent to the recipient via sendto().
for i in range(1):
    sock.sendto(struct.pack('!i', data), (HOST, PORT))
    data+=1
received = str(sock.recv(1024), "utf-8")

print("Sent:     {}".format(data))
print("Received: {}".format(received))
