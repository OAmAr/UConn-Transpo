import sys
sys.path.insert(0, '../server')
from server import *

RSLoop = threading.Thread(target=rideSystemsLoop)
RSLoop.start()
sleep(4)

print(shared_data['routes'][0]['MapLatitude']) #[1])



class BusData:
    def __init__(self,inputDictionary=None):
        if inputDictionary:
            self.data = inputDictionary
        else:
            self.data = dict()

    def getBus(self,line):
        notFound = True
        i=0
        while notFound:
            current = self.data['routes'][i]
            if current['Description'] == line:
                notFound = True
                return current
            else:
                i = i+1

    def getLatitude(self,bus):
        return bus['MapLatitude']


a = BusData(shared_data)
print(a.getBus('Red'))

a=BusData(shared_data)
print(a.getBus("Blue"))
print(a.getLatitude(a.getBus("Blue")))
