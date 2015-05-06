'use strict';

var routeHealthcheck = require('../../routes/route-diagnostics'),
	routeTurnstile = require('../../routes/route-turnstile'),
	settings = require('../app/settings');

module.exports = function(router) {
	//Healthcheck
	router.route('/healthcheck')
		.get(routeHealthcheck.healthCheck);

	router.route('/turnstile/:date/:time')
		.get(routeTurnstile.getDataByTimeAndDate)
};
