/**
 * @file MMM-WindyV2.js
 *
 * @author fewieden MMM-voice
 * @inspirationalModule MMM-windy
 * @re-written by @TheStigh
 *
 * @license MIT
 *
 * @see  https://github.com/Mykle1/MMM-VoiceControlMe
 */

/* global Module Log MM */

/**
 * @external MM 	  @see https://github.com/MichMich/MagicMirror/blob/master/js/main.js
 *
 * @module MMM-WindyV2
 *
 * @requires MM
 */

Module.register('MMM-WindyV2', {

	defaults: {
		initLoadDelay: 50,
		apiKey: '',							// insert your API key here
		latitude: 69.23,					// latitude for center of map
		longitude: 17.98,					// longitude for center of map
		zoomLevel: 6,						// set zoom level of map
		showLayer: 'wind',					// Supported layers in free API versions are: wind, rain, clouds, temp, pressure, currents, waves
		rotateLayers: true,					// if set to 'true' it will rotate layers as specified in 'layersToRotate'
		layersToRotate: ['wind','rain'],	// choose from wind, rain, clouds, temperature, pressure, currents, waves
		delayRotate: 5000					// in milliseconds, default per 5 seconds
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
		//console.log(wrapper);

		return wrapper;
	},
  
	start: function() {
		let self = this;
		Log.info('Starting module: ' + this.name);
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

    notificationReceived(notification, payload, sender) {
//        if (notification === 'ALL_MODULES_STARTED') {
//            this.sendNotification('REGISTER_VOICE_MODULE', this.voice);
//        
//		} else if (notification === 'VOICE_WINDY' && sender.name === 'MMM-VoiceControlMe') {
//            this.checkCommands(payload);
//        
//		} else if (notification === 'VOICE_MODE_CHANGED' && sender.name === 'MMM-VoiceControlMe' && payload.old === this.voice.mode) {
//            this.updateDom(300);

		if (notification === 'HELLO__MIRROR') {
				const options = {
				key: this.config.apiKey,
				zoom: 2,
				};			
	
			windyInit (options,windyAPI => {
				const {store} = windyAPI;
				var overlay = store.get('overlay');
				store.set('overlay','rain');
				//store.on('overlay', ovr => {});
				});
		this.updateDom(300);
		Log.info('<<<>>> ConsoleLog message about HELLO MIRROR received')
		}
    },


	scheduleInit: function(delay) {
		setTimeout(() => {
			const options = {
				graticule: false,
				key: this.config.apiKey,
				lat: this.config.latitude,
				lon: this.config.longitude,
				zoom: this.config.zoomLevel,
						//map.setZoom(14);
						//map.options.minZoom = 10;
			};

		windyInit (options, windyAPI => {
			if (this.config.rotateLayers) {
				const {store,broadcast} = windyAPI;
				var overlays = this.config.layersToRotate;
				
				//var elements = overlays.split(',');						// will be here to count elements inside 'overlays'
				//Log.info('<<<>>> counted elements :'+elements.length);	// will be here to count elements inside 'overlays'

				var i = 0;
				setInterval( ()=> {
					i = (i === 1 ? 0 : i + 1 ),								// will replace '1 ? 0' with counted 'elements ? 0'
					store.set('overlay', overlays[i]);
				}, this.config.delayRotate);
			}

			const {store} = windyAPI;
			var overlay = store.get('overlay');
			store.set('overlay',this.config.showLayer);
			//store.on('overlay', ovr => {});
			});
		
		}, delay);
	},
  
  getStyles: function() {
    return [
      'MMM-WindyV2.css'
    ];
  }
})
