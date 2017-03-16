import Stop
import Route
import Server

class Bus:
	def __init__(self, Color):
		self._colordict = 
		{"blue":0, "red":1,"green":2, "yellow": 3, "orange": 4,"purple":5}
		self.route = 
		for line in shared_data['routes']:
			i = 0
			colordict[0] = line["Description"]
			i++
	def timetostop(self, stop):
		return 0
	def nextstop(self):
		return stop
	def getlocation(self):
		
    # for line in shared_data['routes']:
    #     print(line['Description'])
    # blue = 0
    # red = 1
    # green = 2
    # yellow = 3
    # orange = 4
    # purple = 5

    def getStops(busNumber):
        l = len(shared_data['routes'][busNumber]['Stops'])
        stops = []
        for i in range(l):
            stops.append(shared_data['routes'][busNumber]['Stops'][i]['Description'])
        return(stops)

    # print(getStops(0))

    def getTime(busNumber,start,end):
        l = len(shared_data['routes'][busNumber]['Stops'])
        time = 0
        startCounting = False

        for stops in range(l*2):
            stops = stops%l
            current = shared_data['routes'][busNumber]['Stops'][stops]
            print
            if current['Description'] == start:
                startCounting = True
            if startCounting and current['Description'] == end:
                return time
            if startCounting:
                time = time + current['SecondsToNextStop']
