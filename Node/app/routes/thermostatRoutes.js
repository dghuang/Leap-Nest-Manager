//routes to get and put values for thermostats

module.exports = function(app, request, privateConfig) {

	var nestRoot = 'https://developer-api.nest.com';
	var accessCode = privateConfig.ACCESS_CODE;

	//Returns a list of the virtual structures associated with this nest accoutn
	app.get('/nest/structures', function(req, res) {
		request(nestRoot + '?auth=' + accessCode, function (error, response, body) {
			if (!error && response.statusCode/100 !== 4) {
				var nestObj = JSON.parse(body);
				var structures = {};
				//Gives you all the structure objects with all of their thermostat information
				var sKeys = Object.keys(nestObj.structures);
				for (var i = sKeys.length - 1; i >= 0; i--) {
					var struct = nestObj.structures[sKeys[i]];
					var thermostats = {};
					for (var j = struct.thermostats.length - 1; j >= 0; j--) {
						var tKey = struct.thermostats[j];
						thermostats[tKey] = nestObj.devices.thermostats[tKey];
					}
					struct.thermostats = thermostats;
					structures[sKeys[i]] = struct;
				}
				res.status(200).json(structures);
			} else {
				res.send(200);
			}
		});
	});


	app.put('/thermostats/temperature', function(req, res) {
		//
		var nestUrl = nestRoot + '/devices/thermostats/';
		var tKey = req.body.key;
		var temperature = {target_temperature_f: req.body.temperature};
		request(
		    {
		    	uri: nestUrl + tKey + '?auth=' + accessCode,
		    	method: 'PUT',
		    	json:true,
		    	body: temperature
		    },
			function (error, response, body) {
		    	if (!error && response.statusCode/100 !== 4) {
					res.status(200).json(body);
				} else {
					res.send(400);
				}
			}
		)
	});
};