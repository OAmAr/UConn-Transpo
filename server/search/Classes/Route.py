import operator
try:
    #from search.Classes.data import shared_data
   # from search.Classes.data import bus_data as route_data
    from search.Classes.facade import BusData as RouteData
    from search.Classes.Bus import Bus
except ImportError:
    #from data import shared_data
    #from data import busdata as route_data
    from facade import BusData as RouteData
    from Bus import Bus

class Route:
    '''
        Route class takes the name of route shared data
    '''
    def __init__(self, color,sdata):#,index = None):
        '''
            Basic Initializer, stores buses, stops {stopname, [stopOrder,data]}, routeId, routedatadata, sharedata, stop order
        '''
        self._color = color #color must be the name of a route, caps must match
        self._buses = []
        self._stops = dict() #name, [index,dict]
        self._sdata = sdata
        self._data  = RouteData(sdata).getBus(color)
        self._rtID  = self._data["RouteID"]
        #if index:
        #    self._index = index
        self._populateBuses()
        self._populateStops()
        self._order = None
        self.orderstops()
    
    def orderstops(self):
        '''
            Either sets the order of stops if it doesnt exist or returns it if it does . [stop0.....stopn] in order of visit
        '''
        if self._order:
            return self._order
        #self._order = sorted(self._stops.items(), key = operator.itemgetter(1)[0])
        phase1 = [(name,self._stops[name][0]) for name in self._stops]
        phase2 = sorted(phase1, key=operator.itemgetter(1))
        phase3 = [item[0] for item in phase2] #this is a list of stop names sorted by the order they appear on the route
        self._order = phase3
    
    def update(self):
        '''Updates all buses on route'''
        for bus in self.getBuses():
            bus.update()
    def _populateBuses(self):
        '''Populates bus list based on locations'''
        temp = []
        locs = self._sdata['locations']
        for bus in locs:
            if bus["RouteID"] == self.getID():
                self._buses.append(Bus(bus["VehicleID"],self.getColor(),self,self._sdata))
        #self._buses=temp

    def _populateStops(self):
        '''
            Popuates self._stops dict with key stop name as a string and value [index on route, stop dict on route]
        '''
        for i in range(len(self._data["Stops"])):
            stop = self._data["Stops"][i]
            self._stops[stop['Description']]=[i,stop]
    def getBuses(self):
        '''Returns list of bus objects'''
        return self._buses

    def getColor(self):
        '''Returns color'''
        return self._color

    def getStops(self):
        '''Returns stop dictionary, not objects'''
        return self._stops

    def getID(self):
        '''Returns routeId'''
        return self._rtID

    def stopsAt(self, stop):
        '''Returns true if Route stops at stop'''
        return stop in self._stops

   # def stopIndex(self, stop):
    '''stopIndex is a deprecated functions (I forgot about it)'''
    #    return self.getStops()[stop]
