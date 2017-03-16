from data import shared_data
#figure out how bus figures out which stop it is at, figure out how bus data is supposed to work, figure out how bus number works
#add timetostop, nextstop,getlocation
class Bus:
	def __init__(self, number, color):
		 self._color  = color
		 self._number = number
		 self._data   = BusData(shared_data).getBus(self.getColor())
	def getColor():
		return self._color
	def getNumber():
		return self._number


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
                notFound = False
                return current
            else:
                i = i+1

    def getLatitude(self,bus):
        return bus['MapLatitude']

#for route in shared_data['routes']:
#	print(route['Description'])
