'use strict';

var async = require('async'),
	turnstileService = require('../services/service-turnstile'),
	settings = require('../config/app/settings');

/*
 * List of analytics
 * 1) Train color wise
 * 2) Complete visualization
 * 3) Month wise average metrics / year
 * 4) Day wise average metric / year
 * 5) Yearly average history
 * 6) Peak Hour-wise weekday
 * 7) Hour-wise weekend.
 * 7) Rating
 */

exports.getDataForAnalytic = function(req, res) {
	var analytic = req.params.analytic,
		station = req.params.station;

	switch(analytic) {
		case 'train':
			break;

		case 'avmonth':
			break;

		case 'avday':
			break;

		case 'avyear':
			break;

		case 'peakweekday':
			break;

		case 'rating':
			break;
	}
};

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
