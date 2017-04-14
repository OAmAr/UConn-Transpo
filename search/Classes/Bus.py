try:
    from search.Classes.data import shared_data
    from search.Classes.data import BusData
except ImportError:
    from data import shared_data
    from data import BusData
#figure out how bus figures out which stop it is at, figure out how bus data is supposed to work, figure out how bus number works
#add timetostop, nextstop,getlocation
class Bus:
    '''
        Bus class represents a bus, keepts track of route color, vehicle ID, nextlocation, route data as _data, time to nextlocation
    '''
    def __init__(self, number=None, color=None, route=None,sdata=shared_data):
        '''
            basic init function, takes bus number, bus color, and route object (?) and inits the rest on its own
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
        return self._route

    def getColor(self):
        '''
            get color of bus
        '''
        return self._color
    def getNumber(self):
        '''
            get number of bus
        '''
        return self._number
    def getNextTime(self):
        '''
            get time to next stop
        '''
        return self._time
    def getLocation(self):
        '''
            get next stop
        '''
        return self._location
    def update(self):
        '''
            update data
        '''
        self.updateLocation()
    def updateLocation(self):
        '''
        update time to next stop and next stop
        '''
        for stop in self._sdata['stops']:
            for vehicle in stop["VehicleEstimates"]:
                if self.getNumber() == vehicle["VehicleID"]:
                    self._timetoloc = vehicle["SecondsToStop"]
                    for stop in self.getRoute().getStops():
                        if stop["RouteStopID"] == vehicle["RouteStopID"]:
                            self._location = stop["Description"]
