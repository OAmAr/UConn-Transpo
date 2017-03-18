#literally just a x y pair on map. Not sure how map works yet, maybe set some boundaries? Probably better for map class to handle
class Location: 
	def __init__(self, x=None, y=None):
		self._coords = [x,y]
	def getLocation(self):
		return (x,y)
	def setX(self,x):
		self._coords[0]=x
	def setY(self,y):
		self._coords[1]=y
	def getX(self,x):
		return self._coords[0]
	def getY(self,y):
		return self._coords[1]
	def resetCoords(self, x, y):
		self.setX(x)
		self.setY(y)
