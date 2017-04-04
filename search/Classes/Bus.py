try:
    from search.Classes.data import shared_data
    from search.Classes.data import BusData
except ImportError:
    from data import shared_data
    from data import BusData
#figure out how bus figures out which stop it is at, figure out how bus data is supposed to work, figure out how bus number works
#add timetostop, nextstop,getlocation
class Bus:
	def __init__(self, number, color):
<<<<<<< HEAD
		 self._color  = color
		 self._number = number
		 self._data   = BusData(shared_data).getBus(self.getColor())
		 self._currentLocation = 
	def getColor():
		return self._color
	def getNumber():
		return self._number
=======
	    self._color  = color
	    self._number = number #this should match the vehicle ID 
	    self._data   = BusData(shared_data).getBus(self.getColor())
            self._location = None #next location
            self._time = None #time to next location in seconds
	    self.updateLocation()
        def getColor(self):
	    return self._color
	def getNumber(self):
	    return self._number
        def getTime(self):
            return self._time
        def getLocation(self):
            return self._location
        
        def update(self):
            self.updateLocation()
        def updateLocation(self):
            for stop in shared_data['stops']:
                for vehicle in stop["VehicleEstimates"]:
                    if self.getNumber() == vehicle["VehicleID"]:
                        self._location = vehicle["VehicleID"]
                        self._timetoloc = vehicle["SecondsToStop"]
>>>>>>> 7e20b1652a296c7d3a33ca7f3fb8a64e233908ce

	def timeToStop(self,startStop):
