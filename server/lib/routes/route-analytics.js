'use strict';

var async = require('async'),
	turnstileService = require('../services/service-turnstile'),
	monthwiseModel = require('../db/models/model-monthwise-av').Model,
	yearwiseModel = require('../db/models/model-yearwise-av').Model,
	daywiseModel = require('../db/models/model-daywise-av').Model,
	peakDayModel = require('../db/models/model-peakDay-av').Model,
	peakEveModel = require('../db/models/model-peakEve-av').Model,
	settings = require('../config/app/settings');

/*
 * List of analytics
 * 1) Train Line wise
 * 2) Complete visualization
 * 3) Month wise average metrics / year
 * 4) Day wise average metric / year
 * 5) Yearly average history
 * 6) Peak Hour Day
 * 7) Peak Hour Eve
 */

exports.getDataForAnalytic = function(req, res) {
	var analytic = req.params.analytic,
		station = req.params.station;

	switch(analytic) {
		case 'train':
			break;

		case 'avmonth':
			_monthWiseAv(res, station);
			break;

		case 'avday':
			_dayWiseAv(res, station);
			break;

		case 'avyear':
			_yearWiseAv(res, station);
			break;

		case 'peakweekday':
			_peakWeekDay(res, station);
			break;

		case 'peakeve':
			_peakEve(res, station);
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

function _monthWiseAv(res, station) {
	new monthwiseModel().retrieve({remote: station}, function(docs) {
		res.send(docs);
		res.end();
	}, function(error) {
		if (error) {
			settings.log.fatal(error.message);
			res.status(500).send({message: 'Internal Server Error'});
		}
		res.end();
	});
}

function _yearWiseAv(res, station) {
	new yearwiseModel().retrieve({remote: station}, function(docs) {
		res.send(docs);
		res.end();
	}, function(error) {
		if (error) {
			settings.log.fatal(error.message);
			res.status(500).send({message: 'Internal Server Error'});
		}
		res.end();
	});
}

function _dayWiseAv(res, station) {
	new daywiseModel().retrieve({remote: station}, function(docs) {
		res.send(docs);
		res.end();
	}, function(error) {
		if (error) {
			settings.log.fatal(error.message);
			res.status(500).send({message: 'Internal Server Error'});
		}
		res.end();
	});
}

function _peakWeekDay(res, station) {
	new peakDayModel().retrieve({remote: station}, function(docs) {
		res.send(docs);
		res.end();
	}, function(error) {
		if (error) {
			settings.log.fatal(error.message);
			res.status(500).send({message: 'Internal Server Error'});
		}
		res.end();
	});
}

function _peakEve(res, station) {
	new peakEveModel().retrieve({remote: station}, function(docs) {
		res.send(docs);
		res.end();
	}, function(error) {
		if (error) {
			settings.log.fatal(error.message);
			res.status(500).send({message: 'Internal Server Error'});
		}
		res.end();
	});
}