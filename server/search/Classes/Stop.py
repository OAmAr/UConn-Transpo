try:
    from search.Classes.Location import Location
    #from search.Classes.data import shared_data
except ImportError:
    from Location import Location
    #from data import shared_data
#maybe dont need routes stopping at a stop? Kinda nice to have though. Static info can be generated and loaded.
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
