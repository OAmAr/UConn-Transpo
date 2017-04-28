try:
    from server.search.Classes.Location import Location
except ImportError:
    from Location import Location

class Stop(Location):
    def __init__(self, x,y,name,sdata):
        Location.__init__(self, x,y)
        self._sdata = sdata
        self._name = name
        self._routes = set()
        self._setRoutes()

    def _setRoutes(self):
        for route in self._sdata['routes']:
    	    #print(route["Stops"][0])
    	    for stop in route["Stops"]:
                if self.getName()==stop["Description"]:
                    self._routes.add(route["Description"])

    def getName(self):
    	return str(self._name)
    def getRoutes(self):
    	return self._routes
    def update(self):
        return
