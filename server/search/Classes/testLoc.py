import unittest
try:
    from server.search.Classes.Location import Location
except ImportError:
    from Location import Location

class testLoc(unittest.TestCase):
	def testNoParInit(self):
		L = Location(None,None)
		self.assertEqual(L.getLocation(), [None,None])
	
	def testgetBoth(self):
		L = Location(8,7)
		self.assertEqual(L.getLocation(), [8,7])
	
	def testGetSingle(self):
		L = Location(8,7)
		self.assertEqual(L.getX(), 8)
		self.assertEqual(L.getY(), 7)
	
	def testSetSingle(self):
		L = Location(None,None)
		self.assertEqual(L.getLocation(), [None,None])
		L.setX(8)
		L.setY(7)
		self.assertEqual(L.getLocation(), [8,7])
		self.assertEqual(L.getX(), 8)
		self.assertEqual(L.getY(), 7)
	
	def testReset(self):
		L = Location(None,None)
		self.assertEqual(L.getLocation(), [None,None])
		L.setX(8)
		L.setY(7)
		
		self.assertEqual(L.getLocation(), [8,7])
		self.assertEqual(L.getX(), 8)
		self.assertEqual(L.getY(), 7)
		L.resetCoords(9,9)
		self.assertEqual(L.getLocation(), [9,9])

if __name__ == "__main__":
	unittest.main()
