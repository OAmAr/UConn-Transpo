from Location import Location
from data import shared_data
#maybe dont need routes stopping at a stop? Kinda nice to have though. Static info can be generated and loaded.
class Stop(Location):
	def __init__(self, x,y,name):
		Location.__init__(self, x,y)
		self._name = name
		self._routes = set()
		self._setRoutes()
	#todo: set routes
	

	def getRoutes(self):
		return self._routes
