import unittest
try:
    from Map import Map
    from data import shared_data
    from tda import testData
except ImportError:
    from Map import Map
    from data import shared_data

# for i in range(len(shared_data['routes'])):
#     print(i,shared_data['routes'][i]['Description'])

blueLine = testData['routes'][0]['Description']
# print(blueLine)
# print(shared_data['routes'][0]['Stops'][0]['Description'])
# blue = shared_data(['routes'][0]['Description'])
# print(blue)

lines = {testData['routes'][i]['Description']:i for i in range(len(testData['routes']))}
blue = lines['Blue']
blueStops = [testData['routes'][blue]["Stops"][i] for i in range(len(testData['routes'][blue]["Stops"]))]
# print(blueStops)

def getAllTimes(routeColor):
    # takes string routeColor
    # returns a list of pairs in the format:
    # (stop, seconds until next stop)
    timeLookup = dict()
    lines = {testData['routes'][i]['Description']:i for i in range(len(testData['routes']))}
    for line in lines:
        index = lines[line]
        stops = [testData['routes'][index]["Stops"][i] for i in range(len(testData['routes'][index]["Stops"]))]
        out = []
        for i in range(len(stops)):
            out.append((stops[i]['Description'],stops[i]['SecondsToNextStop']+stops[i]['SecondsAtStop']))
        timeLookup[line] = out
    return(timeLookup[routeColor])

def getTime(start,stop,route):
    results = getAllTimes(route)
    for i in getAllTimes(route):
        pass

# print(getAllTimes('Blue'))
class testLoc(unittest.TestCase):
    def testNonrealStop(self):
        m = Map(testData)
        # print(m.getTime('North Garage', 'Hilltop Dorms Southbound','Blue'))
        # # myMap = Map(shared_data)
        # # print(myMap.getStops())
        # print(m.getTime('North Garage', 'Hilltop Dorms Southbound','Blue'))
        # print(m.getTime('North Garage', 'Hilltop Dorms Southbound','Blue'))
        m.getDirections("Buckley, North Garage")


    	# self.assertEquals(myMap.getTime("MSB","Non-real location"),None) # maybe this should raise an error?


    def testBasic(self):
        pass
    	# L = Location(8,7)
    	# self.assertEqual(L.getLocation(), [8,7])


if __name__ == "__main__":
    unittest.main()
