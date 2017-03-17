from data import shared_data
#figure out how bus figures out which stop it is at, figure out how bus data is supposed to work, figure out how bus number works
#add timetostop, nextstop,getlocation
class Bus:
	def __init__(self, number, color):
		 self._color  = color
		 self._number = number
		 self._data   = BusData(shared_data).getBus(self.getColor())
	def getColor():
		return self._color
	def getNumber():
		return self._number


