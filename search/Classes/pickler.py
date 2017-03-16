import os
os.chdir('../../server')
import server
import pickle

#color_index
colordict={} #color to route number mapping
route_stop_dict={} #route number to dictionary of stops and stop index
for line in shared_data['routes']:
	i=0
	colordict[i] = line["Description"]
	for stop in shared_data[0]['Stops']:
		j = 0
		stop_dict[i]={}
		stop_dict[i][stop['Description']]=j
		j+=1
	i+=1

with open('color_dict.pck', 'wb+') as f:
	pickle.dump(colordict, f)
with open('route_stop_dict.pck', 'wb+') as f:
	pickle.dump(route_stop_dict, f)
