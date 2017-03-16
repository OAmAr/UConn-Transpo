import sys
sys.path.insert(0, '../server')
from server import *

RSLoop = threading.Thread(target=rideSystemsLoop)
RSLoop.start()

sleep(4)

def getStops(busNumber):
    l = len(shared_data['routes'][busNumber]['Stops'])
    stops = []
    for i in range(l):
        stops.append(shared_data['routes'][busNumber]['Stops'][i]['Description'])
    return(stops)

def getTime(busNumber,start,end):
    l = len(shared_data['routes'][busNumber]['Stops'])
    time = 0
    startCounting = False

    for stops in range(l*2):
        stops = stops%l
        current = shared_data['routes'][busNumber]['Stops'][stops]
        currentTime = 7.27
        print(current['Description'] + ' : ' + str(current['SecondsToNextStop']))


        if current['Description'] == start:
            startCounting = True
        if startCounting and current['Description'] == end:
            print(currentTime)
            return time
        if startCounting:
            # print(current['Description'])
            # print(current['SecondsToNextStop'])
            print('Total time: ' + str(time))
            currentTime = currentTime + current['SecondsToNextStop']/(60*60)
            # print(currentTime)
            time = time + current['SecondsToNextStop']



# print(shared_data['routes'][0]['Stops'][0]['Description'])
# print(shared_data['routes'][0]['Stops'][0]['SecondsToNextStop'])
#
# print(shared_data['routes'][0]['Stops'][1]['Description'])
# print(shared_data['routes'][0]['Stops'][1]['SecondsToNextStop'])

print(getTime(5,'Clubhouse Apartments','MSB'))
