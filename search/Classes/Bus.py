try:
    from search.Classes.data import shared_data
    from search.Classes.data import BusData
except ImportError:
    from data import shared_data
    from data import BusData
#figure out how bus figures out which stop it is at, figure out how bus data is supposed to work, figure out how bus number works
#add timetostop, nextstop,getlocation
class Bus:
    def __init__(self, number=None, color=None, route=None):
        self._color  = color
        self._number = number #this should match the vehicle ID 
        self._data   = BusData(shared_data).getBus(self.getColor())
        self._location = None #next location
        self._time = None #time to next location in seconds
        self.updateLocation()
        self._route = route
        
    def getColor(self):
        return self._color
    def getNumber(self):
        return self._number
    def getNextTime(self):
         return self._time
    def getLocation(self):
         return self._location
        
    def update(self):
        self.updateLocation()
       
    def updateLocation(self):
        for stop in shared_data['stops']:
            for vehicle in stop["VehicleEstimates"]:
                if self.getNumber() == vehicle["VehicleID"]:
                    self._timetoloc = vehicle["SecondsToStop"]
                    for stop in self.getRoute().getStops():
                        if stop["RouteStopID"] == vehicle["RouteStopID"]:
                            self._location = stop["Description"]
    
        
