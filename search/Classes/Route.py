try:
    from search.Classes.data import shared_data
    from search.Classes.data import bus_data as route_data
except ImportError:
    from data import shared_data
    from data import busdata as route_data

class Route:
    def __init__(self, color,index = None):
        self._color = color #color must be the name of a route, caps must match
        self._buses = []
        self._stops = dict() #name, index
        self._data  = route_data.getBus(color)
        self._rtID  = self._data["RouteID"]
        if index:
        	self._index = index
        self._populateBuses()
        self._populateStops()
        def update(self):
            for bus in self.getBuses():
                bus.updated()
    def _populateBuses(self):
        temp = []
        locs = shared_data['locations']
        for bus in locs:
        	if bus["RouteID"] == self.getID():
        		self._buses.append(bus["VehicleID"],self.getColor(),self)
        self._buses=temp

    def _populateStops(self):
        for i in range(self._data["Stops"]):
        	stop = self._data["Stops"][i]
                self._stops[stop]=i
    def getBuses(self):
        return self._buses

    def getColor(self):
        return self._color

    def getStops(self):
        return self._stops

    def getID(self):
        return self._rtID

    def stopsAt(self, stop):
        return stop in self._stops

    def stopIndex(self, stop):
        return self.getStops()[stop]
