/**
 * @file MMM-WindyV2.js
 *
 * @inspirationalModule MMM-windy
 * @re-written by @TheStigh
 *
 * @license MIT
 *
 * @see  https://github.com/Mykle1/MMM-VoiceControlMe
 */

/**
 * @external MM 	  @see https://github.com/MichMich/MagicMirror/blob/master/js/main.js
 *
 * @module MMM-WindyV2
 *
 * @requires MM
 */

var currentZoom

Module.register('MMM-WindyV2', {

	defaults: {
		initLoadDelay: 50,
		apiKey: '',												// insert your API key here
		latitude: 69.23,									// latitude for center of map
		longitude: 17.98,									// longitude for center of map
		zoomLevel: 6,											// set zoom level of map
		showLayer: 'wind',								// Supported layers in free API versions are: wind, rain, clouds, temp, pressure, currents, waves
		rotateLayers: true,								// if set to 'true' it will rotate layers as specified in 'layersToRotate'
		layersToRotate: ['wind','rain'],	// choose from wind, rain, clouds, temperature, pressure, currents, waves
		delayRotate: 5000,								// in milliseconds, default per 5 seconds
		wMinZoom: 3,											// set minimum zoom level for WindyV2
		wMaxZoom: 17,											// set maximum zoom level for WindyV2
		windyMetric: 'm/s',								// 'kt', 'bft', 'm/s', 'km/h' and 'mph'
		updateTimer: 3600000							// update per hour
	},

    voice: {
        mode: 'WINDY',
			sentences: [
            'SHOW WIND',
            'SHOW RAIN',
            'SHOW CLOUDS',
            'SHOW TEMPERATURE',
            'SHOW PRESSURE',
            'SHOW CURRENTS',
            'SHOW WAVES'
			]
	},

	getScripts: function() {
		return [
			'https://unpkg.com/leaflet@0.7.7/dist/leaflet.js',
			];
	},

	getDom: function() {
		var self = this;
		var wrapper = document.createElement('div');
		if (self.config.apiKey === '') {
			wrapper.innerHTML = 'Please set the windy.com <i>apiKey</i> in the config for module: ' + this.name + '.';
			wrapper.className = 'dimmed light small';
			return wrapper;
			}

		if (!self.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.innerClassName = 'dimmed light small';
			return wrapper;
			}
		var mapDiv = document.createElement('div');
		mapDiv.id = 'windy';
		wrapper.appendChild(mapDiv);

		return wrapper;
	},
  
	start: function() {
		let self = this;
		Log.info('Starting module: ' + this.name);

		currentZoom = this.config.zoomLevel;

		setInterval(function() {
				self.updateDom();
				self.scheduleInit(self.config.initLoadDelay);
		}, this.config.updateTimer);

		self.loaded = false;
		var scripts = [
			'https://api4.windy.com/assets/libBoot.js'
			];
		
		var loadScripts = function(scripts) {
			var script = scripts.shift();
			var el = document.createElement('script');
			el.type = 'text/javascript';
			el.src = script;
			el.setAttribute('defer', '');
			el.setAttribute('async', '');

		el.onload = function() {
			if (scripts.length) {
				loadScripts(scripts);
			} else {
				self.loaded = true;
				self.updateDom();
				self.scheduleInit(self.config.initLoadDelay);
				}
			};
			document.querySelector('body').appendChild(el);
		};
		loadScripts(scripts);
	},
/////////////////////////////////////////////////////////////////////////////////////
	scheduleInit: function(delay) {
		setTimeout(() => {
		const options = {
				graticule: false,
				key: this.config.apiKey,
				lat: this.config.latitude,
				lon: this.config.longitude,
				animate: false,
				zoom: this.config.zoomLevel,
				minZoom: 3,
				maxZoom: 18,
			};

			if (!window.copy_of_W) {
				window.copy_of_W = Object.assign({}, window.W);
				}
				if (window.W.windyBoot) {
				window.W = Object.assign({}, window.copy_of_W);
				}

				windyInit (options, windyAPI => {
					if (this.config.rotateLayers) {
						const {store,map,overlays} = windyAPI;
						var overlayers = this.config.layersToRotate;
						var windMetric = overlays.wind.metric;
						overlays.wind.setMetric(this.config.windyMetric);

						var h = overlayers.length;
						h=h-1;
						
						var i = 0;
						setInterval( ()=> {
							i = (i === h ? 0 : i + 1 ),
							store.set('overlay', overlayers[i]);
							Log.info('<<<>>> Current showing Overlay: '+overlays);
						}, this.config.delayRotate);
					}
					
					const {store,map,overlays} = windyAPI;
					//var overlay = store.get('overlay');
					var windMetric = overlays.wind.metric;
					store.set('overlay',this.config.showLayer);
									
					var topLayer = L.tileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png', {
							attribution: 'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, ',
							minZoom: 12,
							maxZoom: 17
							}).addTo(map);
					topLayer.setOpacity('0');

					map.on('zoomend', function() {
							if (map.getZoom() >= 12) {
									topLayer.setOpacity('1');
							} else {
									topLayer.setOpacity('0');
							}
					});
					overlays.wind.setMetric(this.config.windyMetric);
					map.setZoom(currentZoom);
				});
		}, delay);
	},

/////////////////////////////////////////////////////////////////////////////////////
    notificationReceived(notification, payload, sender) {
		if (notification === 'CHANGEWIND') {
				const options = {key: this.config.apiKey};			
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}
				windyInit (options,windyAPI => {
				const {store,map,overlays} = windyAPI;
				var overlay = store.get('overlay');
				var windMetric = overlays.wind.metric;
				overlays.wind.setMetric('m/s');
				store.set('overlay','wind');
				});

/////////////////////////////////////////////////////////////////////////////////////
		} else if (notification === 'CHANGERAIN') {
				const options = {key: this.config.apiKey};			
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}
				windyInit (options,windyAPI => {
				const {store,map} = windyAPI;
				var overlay = store.get('overlay');
				store.set('overlay','rain');
				});
		
/////////////////////////////////////////////////////////////////////////////////////
		} else if (notification === 'CHANGERAIN') {
				const options = {key: this.config.apiKey};			
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}
				windyInit (options,windyAPI => {
				const {store,map} = windyAPI;
				var overlay = store.get('overlay');
				store.set('overlay','rain');
				});

/////////////////////////////////////////////////////////////////////////////////////
		} else if (notification === 'CHANGECLOUDS') {
				const options = {key: this.config.apiKey};			
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}
				windyInit (options,windyAPI => {
				const {store,map} = windyAPI;
				var overlay = store.get('overlay');
				store.set('overlay','clouds');
				});

/////////////////////////////////////////////////////////////////////////////////////
		} else if (notification === 'CHANGETEMP') {
				const options = {key: this.config.apiKey};			
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}
				windyInit (options,windyAPI => {
				const {store,map} = windyAPI;
				var overlay = store.get('overlay');
				store.set('overlay','temp');
				});
		
/////////////////////////////////////////////////////////////////////////////////////
		} else if (notification === 'CHANGEPRESSURE') {
				const options = {key: this.config.apiKey};			
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}
				windyInit (options,windyAPI => {
				const {store,map} = windyAPI;
				var overlay = store.get('overlay');
				store.set('overlay','pressure');
				});

/////////////////////////////////////////////////////////////////////////////////////
		} else if (notification === 'CHANGECURRENTS') {
				const options = {key: this.config.apiKey};
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}			
			windyInit (options,windyAPI => {
				const {store,map} = windyAPI;
				var overlay = store.get('overlay');
				store.set('overlay','currents');
				});

/////////////////////////////////////////////////////////////////////////////////////
		} else if (notification === 'CHANGEWAVES') {
				const options = {key: this.config.apiKey};	
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}		
			windyInit (options,windyAPI => {
				const {store,map} = windyAPI;
				var overlay = store.get('overlay');
				store.set('overlay','waves');
				});

/////////////////////////////////////////////////////////////////////////////////////
		} else if (notification === 'ZOOMIN') {
				const options = {key: this.config.apiKey};

				var zLevel = W.map.getZoom();
				zLevel = zLevel + 1;
				if (zLevel > this.config.wMaxZoom) {
						zLevel = zLevel - 1;
						};

				Log.info('<<<>>> Zoom Level is :'+W.map.getZoom());
				Log.info('<<<>>> zLevel Level is :'+zLevel)

				if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}
			windyInit (options,windyAPI => {
						const {store,map} = windyAPI;
						W.map.options.maxZoom=18;
						var topLayer = L.tileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png', {
								attribution: 'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, ',
								minZoom: 12,
								maxZoom: 18
								}).addTo(map);
						topLayer.setOpacity('0');

						map.on('zoomend', function() {
							if (map.getZoom() >= 12) {
									topLayer.setOpacity('1');
							} else {
									topLayer.setOpacity('0');
									}
							});
					map.setZoom(zLevel);
					currentZoom = zLevel;
				});

/////////////////////////////////////////////////////////////////////////////////////
		} else if (notification === 'ZOOMOUT') {
				const options = {key: this.config.apiKey};

				var zLevel = W.map.getZoom();
				zLevel = zLevel - 1;
				if (zLevel < this.config.wMinZoom) {
						zLevel = zLevel + 1;
						};

				Log.info('<<<>>> Zoom Level is :'+W.map.getZoom());
				Log.info('<<<>>> zLevel Level is :'+zLevel)

				if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}
			windyInit (options,windyAPI => {
						const {store,map} = windyAPI;
						var topLayer = L.tileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png', {
								attribution: 'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, ',
								minZoom: 12,
								maxZoom: 18
								}).addTo(map);
						topLayer.setOpacity('0');

						map.on('zoomend', function() {
							if (map.getZoom() <= 12) {
									topLayer.setOpacity('0');
							} else {
									topLayer.setOpacity('1');
									}
							});
					map.setZoom(zLevel);
					currentZoom=zLevel;
				});

/////////////////////////////////////////////////////////////////////////////////////			
			
			} else if (notification === 'ROTATELAYER') {
				const options = {key: this.config.apiKey};	
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}		

				windyInit (options, windyAPI => {
						const {store,map} = windyAPI;
						var overlays = this.config.layersToRotate;
						var h = overlays.length;
						h=h-1;
						//
						var i = 0;
						setInterval( ()=> {
							i = (i === h ? 0 : i + 1 ),
							store.set('overlay', overlays[i]);
							Log.info('<<<>>> Current showing Overlay: '+overlays);
						}, this.config.delayRotate);
					map.setZoom(this.config.zoomLevel);
				});

/////////////////////////////////////////////////////////////////////////////////////
		
			} else if (notification === 'DEFAULTZOOM') {
				const options = {key: this.config.apiKey};	
					if (!window.copy_of_W) {
						window.copy_of_W = Object.assign({}, window.W);
						}
						if (window.W.windyBoot) {
						window.W = Object.assign({}, window.copy_of_W);
						}		
				windyInit (options, windyAPI => {
						const {store,map} = windyAPI;
						var topLayer = L.tileLayer('http://b.tile.openstreetmap.org/{z}/{x}/{y}.png', {
								attribution: 'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, ',
								minZoom: 12,
								maxZoom: 18
								}).addTo(map);
						topLayer.setOpacity('0');

						map.on('zoomend', function() {
							if (map.getZoom() <= 12) {
									topLayer.setOpacity('0');
							} else {
									topLayer.setOpacity('1');
									}
							});
					map.setZoom(this.config.zoomLevel);
					currentZoom = this.config.zoomLevel;
				});		

/////////////////////////////////////////////////////////////////////////////////////

			} else if (notification === 'PLAYANIMATION') {
				document.getElementById('playpause').click();
				}
    },
  
  getStyles: function() {
    return [
      'MMM-WindyV2.css'
    ];
  }
})

