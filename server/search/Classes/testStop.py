import unittest
try:
    from search.Classes.Stop import Stop
    from search.Classes.data import shared_data as sd
except ImportError:
    from Stop import Stop
    from data import shared_data as sd
print("testing stop")
class testStop(unittest.TestCase):
	
	def testStopLoc(self):
		s = Stop(0,3,"ThisIsNotAName",sd)
		self.assertEqual([0,3], s.getLocation())
	def testStopName(self):
		s = Stop(0,3,"ThisIsNotAName",sd)
		self.assertEqual("ThisIsNotAName", s.getName(),sd)
	
	def testStopRoutes(self):
		s = Stop(0,3, "North Garage",sd)
		self.assertEqual(s.getRoutes(), set(["Green", "Silver", "Purple", "Blue", "Yellow"]))
	def testStops2(self):
		s = Stop(0,3, "Silver Falls",sd)
		self.assertEqual(s.getRoutes(), set(["Purple"]))
	def testStopNoRoutes(self):
		s = Stop(0,3, " this is not a name",sd)
		self.assertEqual(s.getRoutes(), set())


if __name__ == "__main__":
	unittest.main()
