try:
    from search.Classes.data import BusData
except ImportError:
    from data import BusData
#figure out how bus figures out which stop it is at, figure out how bus data is supposed to work, figure out how bus number works
#add timetostop, nextstop,getlocation
class Bus:
    '''
        Bus class initializes with Vehicle ID, route color, route object, and shared data
    '''
    def __init__(self, number=None, color=None, route=None,sdata):
        '''
            Basic init function, takes bus number, bus color, and route object (?) and inits the rest on its own
        '''
        self._color  = color
        self._number = number #this should match the vehicle ID
        self._data   = BusData(sdata).getBus(self.getColor())
        self._sdata  = sdata
        self._location = None #next location
        self._time = None #time to next location in seconds
        self._route = route
        self.updateLocation()
    
    def getRoute(self):
        '''
            Returns route object
        '''
        return self._route

    def getColor(self):
        '''
            Returns route name
        '''
        return self._color
    def getNumber(self):
        '''
            Returns Vehicle ID
        '''
        return self._number
    def getNextTime(self):
        '''
            Returns time to next stop
        '''
        return self._time
    def getLocation(self):
        '''
            Returns next stop
        '''
        return self._location
    def update(self):
        '''
            Updates bus data
        '''
        self.updateLocation()
    def updateLocation(self):
        '''
            Updates location data
        '''
        for stop in self._sdata['stops']:
            for vehicle in stop["VehicleEstimates"]:
                if self.getNumber() == vehicle["VehicleID"]:
                    self._timetoloc = vehicle["SecondsToStop"]
                    for stop in self.getRoute().getStops():
                        if stop["RouteStopID"] == vehicle["RouteStopID"]:
                            self._location = stop["Description"]
