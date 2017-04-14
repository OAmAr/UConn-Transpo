class BusData:
    def __init__(self,inputDictionary=None):
        if inputDictionary:
            self.data = inputDictionary
        else:
            self.data = dict()

    def getBus(self,line):
        notFound = True
        i=0
        while notFound:
            current = self.data['routes'][i]
            if current['Description'] == line:
                notFound = True
                return current
            else:
                i = i+1

    def getLatitude(self,bus):
        return bus['MapLatitude']
