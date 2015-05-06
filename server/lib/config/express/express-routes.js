'use strict';

var routeHealthcheck = require('../../routes/route-diagnostics'),
	routeTurnstile = require('../../routes/route-turnstile'),
	routeStations = require('../../routes/route-stations'),
	settings = require('../app/settings');

module.exports = function(router) {
	//Healthcheck
	router.route('/healthcheck')
		.get(routeHealthcheck.healthCheck);

	router.route('/turnstile/:date/:time')
		.get(routeTurnstile.getDataByTimeAndDate)

	router.route('/stations')
		.get(routeStations.getDataByTimeAndDate)
};
