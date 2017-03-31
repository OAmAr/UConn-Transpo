import sys
try:
    from search.Classes.facade import *
except ImportError:
    from facade import *
#sys.path.insert(0,'../../server')
try:
    from search.Classes.server import *
except ImportError:
    from server import *

RSLoop = threading.Thread(target=rideSystemsLoop)
RSLoop.start()
sleep(4)
# this inits shared data

busdata = BusData(shared_data)

#importing this should give access to shared_data)
if __name__ == '__main__':
	print(shared_data['routes'][0])
	#print(shared_data)
