# MMM-WindyV2
A module for MagicMirror2 based on www.windy.com

### Introduction
This is a module for [MagicMirror](https://github.com/MichMich/MagicMirror) that adds the [Windy](https://www.windy.com/) weather map and was originally written by santi4488 as [MMM-windy](https://github.com/santi4488/MMM-windy). This is a re-write that adds several new options, like adding your Lat & Lon to center on your location, setting zoom level and most importantly - adding the layer your prefer to see. You can choose from: wind, rain, clouds, temperature, pressure, currents and waves (free version).

![alt text](https://github.com/santi4488/MMM-windy/blob/master/windy.PNG)

### Configuration
You will need to get your own API key which can be obtained [here](https://api4.windy.com/api-key).
To use the module, add the following to the modules array in your `config/config.js` file:
```
{
	  module: "MMM-WindyV2",
	  position: 'fullscreen_above',         // this must be set to 'fullscreen_above'
	    config: {
		    apiKey: 'YOUR API KEY',
        initLoadDelay: 50,                // optional, default is 50 milliseconds
	      	latitude: YOUR LATITUDE,        // example: 69.123
	        longitude: YOUR LONGITUDE,      // example: 17.123
	        zoomLevel: 6,                   // set your preferred zoom level
	        showLayer: 'rain'			          // wind, rain, clouds, temperature, pressure, currents, waves
      }
},
```

