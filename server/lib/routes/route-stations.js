'use strict';

var async = require('async'),
	stationModel = require('../db/models/model-stations').Model,
	settings = require('../config/app/settings');

exports.getDataByTimeAndDate = function(req, res) {
	new stationModel().retrieve({}, function(stations) {
		res.send(stations);
		res.end();
	}, function (error) {
		if (error) {
			settings.log.fatal(error.message);
			res.status(500).send({message: 'Internal Server Error'});
		}
		res.end();
	});
};