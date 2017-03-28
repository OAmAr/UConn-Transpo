from Location import Location
from data import shared_data
#maybe dont need routes stopping at a stop? Kinda nice to have though. Static info can be generated and loaded.
class Stop(Location):
	
	def __init__(self, x,y,name):
		Location.__init__(self, x,y)
		self._name = name
		self._routes = set()
		self._setRoutes()

	def _setRoutes(self):
		for route in shared_data['routes']:
			#print(route["Stops"][0])
			for stop in route["Stops"]:
				if self.getName()==stop["Description"]:
					self._routes.add(route["Description"])

	def getName(self):
		return str(self._name)
	def getRoutes(self):
		return self._routes
