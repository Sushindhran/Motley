'use strict';

var async = require('async'),
	turnstileService = require('../services/service-turnstile'),
	settings = require('../config/app/settings');

exports.getDataByTimeAndDate = function(req, res) {
	var time = req.params.time.split(':')[0],
		date = req.params.date;

	turnstileService.getDataByTimeAndDate(date, time, function (exits) {
		res.send(exits);
		res.end();

	}, function (error) {
		if (error) {
			settings.log.fatal(error.message);
			res.status(500).send({message: 'Internal Server Error'});
		}
		res.end();
	});
};