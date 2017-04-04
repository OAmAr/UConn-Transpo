try:
    from search.Classes.data  import shared_data
    from search.Classes.Stop  import Stop
    from search.Classes.Route import Route
except ImportError:
    from data import shared_data
    from Stop import Stop
    from Route import Route
#issues:
	#getTime only tells how much time you should spend in bus, not how long you'd have to wait for it to get to you/when it will get
	#issue is its working on routes and not the busses on the routes



#todo:
	#add stops
	#create map from shared_data maybe:
class Map:
	def __init__(self):
		self._stops  = dict() #name and Stop
		self._routes = dict() #name and Route

	def getDirections(self, start, end):
		#given a start and end gives routes that dict of possible route and time it takes
		possible = self.possibleRoutes(start,end)
		times = {route:self.getTime(start,end,route) for route in possible}
		return times


	def getTime(self, start,end, route):
		# i think this will run forever if stops are not in a route

		started = False
		done    = False
		l       = len(stops)
		i       = time = 0
		stops   = self._routes[route]["Stops"]

		while not done and i<l*2:
			if stops[i] == start:
				started == True
			elif started and stops[i] == end:
				done    = True
				started = False
			if started:
				time+= stops[i]["TimeToNextStop"]
				time+= stop[i]["TimeAtStop"]
			i+=1
			if i >= l:
				i=0
		return time

		def getClosestStop(self):
			pass

		def getTimeToClosestStop(self):
			pass


	def possibleRoutes(self, start,end):
		if not start in self._stops or not end in self._stops:
			raise RuntimeError("start or end not in stops")
			return
		possible = []
		for route in self._routes:
			if start in self._routes[route].getStops() and end in self._routes[route].getStops():
				possible.append(route)
		return possible


	def getStops(self):
		return self._stops

	def getRoutes(self):
		return self._routes
