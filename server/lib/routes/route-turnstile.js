'use strict';

var async = require('async'),
	turnstileService = require('../services/service-turnstile'),
	settings = require('../config/app/settings');

exports.getExitsByTime = function(req, res) {
	var time = req.params.time;

	turnstileService.getExitsBytime(time, function (exits) {
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

exports.getEntriesBytime = function(req, res){
	var time = req.params.time;

	turnstileService.getEntriesBytime(time, function (entries) {
		res.send(entries);
		res.end();

	}, function (error) {
		if (error) {
			settings.log.fatal(error.message);
			res.status(500).send({message: 'Internal Server Error'});
		}
		res.end();
	});
};
