import requests
import json
res = requests.get('http://www.uconnshuttle.com/Services/JSONPRelay.svc/GetMapVehiclePoints?method=jQuery1111005010178853515934_1485291299254&ApiKey=8882812681&_=1485291299511')
responseText = res.text
start = responseText.find('[')
# range of actual JSON in the response
decoded = json.loads(responseText[start:(len(responseText) - 2)])

print("VehicleID\tLatitude\tLongitude")
for bus in decoded:
    print("%d\t\t%f\t%f" % (bus['VehicleID'], bus['Latitude'],
    bus['Longitude']))
