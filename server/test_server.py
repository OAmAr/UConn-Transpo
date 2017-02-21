import server.server
import unittest
from time import sleep

class TestRideSystems(unittest.TestCase):
    def test_parseJSON(self):
        # should remove garbage before real json
        testjson = 'really-long-string-of-useless-javascript( [{"RouteID":11}] );'
        parsed = server.server.parseJSON(testjson);
        self.assertEqual(11, parsed[0]["RouteID"])

    def test_RideSystemsLoop(self):
        success = False
        # at least one in five of these should work
        for i in range(5):
            try:
                server.server.updateBusLocations()
                server.server.updateStopInfo()
                server.server.updateRoutes()
                success = True
                sleep(1)
            except Exception as e:
                print(e)
                sleep(0.5)
        self.assertEqual(True, success)

if __name__ == '__main__':
    unittest.main()
