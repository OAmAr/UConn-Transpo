import unittest
from Location import Location

class testLoc(unittest.TestCase):
	def test1(self):
		L = Location()
		self.assertEqual(L.getLocation(), [None,None])
	
	def test2(self):
		L = Location(8,7)
		self.assertEqual(L.getLocation(), [8,7])
		self.assertEqual(L.getX(), 8)
		self.assertEqual(L.getY(), 7)
	
	def test3(self):
		L = Location()
		self.assertEqual(L.getLocation(), [None,None])
		L.setX(8)
		L.setY(7)
		self.assertEqual(L.getLocation(), [8,7])
		self.assertEqual(L.getX(), 8)
		self.assertEqual(L.getY(), 7)
	
	def test4(self):
		L = Location()
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
