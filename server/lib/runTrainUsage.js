'use strict';

var _ = require('lodash');
var path = require('path');
var assert = require('assert');
var fs = require('fs');
var async = require('async');
var hbase = require('hbase');
var moment = require('moment');

var settings = require('./config/app/settings');
var db = require('./db/scripts/db');
var turnstileModel = require('./db/models/model-turnstile').Model;
var trainUsageModel = require('./db/models/model-train-usage').Model;
var stationModel = require('./db/models/model-stations').Model;

var log;

var stationDataPath = path.join(__dirname, './data/stations.json');
var stations = JSON.parse(fs.readFileSync(stationDataPath));

/**
 * Function to load the config
 */
var loadConfig = function() {
	var env = process.env.NODE_ENV || 'development',
		configPath = path.resolve(__dirname, '../config'),
		configFile = path.join(configPath + '/', env + '.json'),
		config = fs.readFileSync(configFile, 'utf8');
	settings.setConfig(config);
};

async.series([
	function(done) {
		loadConfig();
		done();
	},
	function(done) {
		settings.log = log;
		done();
	},
	function(done) {
		console.log('Connecting to mongoDb');
		db.connect(settings.getConfig().dbURL, done, done);
	},
	function(done) {
		_fetchTrainWiseDataAndSave(done, done);
	}
], function(error) {
	if(error) {
		console.log(error);
	} else {
		process.exit(0);
	}
});

function _fetchTrainWiseDataAndSave(success, failure) {
	var lines = [
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'J', 'L', 'M', 'N', 'Q', 'R', 'S', 'Z', '1', '2', '3', '4', '5', '6', '7'
	];

	async.eachSeries(lines,
		function (line, next) {
			console.log('Starting for line:', line);
			_fetchForAllStations(line, function() {
				setImmediate(next);
			}, next);
		},
		function (error) {
			if (error) {
				failure(error);
			} else {
				success();
			}
		}
	);
}

function _fetchForAllStations(line, success, failure) {
	async.eachSeries(stations, function(station, next) {
		var stationCode = _.findKey(station);
		_fetchAllForLine(line, stationCode, function(error) {
			if(error) {
				next(error);
			} else {
				setImmediate(next);
			}
		});
	}, function(error) {
		if(error) {
			failure(error);
		} else {
			success();
		}
	});
}

function _fetchAllForLine(line, code, callback) {
	_getLineForStation(code, function(err, lines) {
		if(err) {
			callback(err);
		} else {
			if(lines.indexOf(line) > -1) {
				_fetchYearwise(line, code, lines, callback);
			} else {
				setImmediate(callback);
			}
		}
	});
}

function _fetchYearwise(line, code, lines, callback) {

	new turnstileModel().retrieve({remote: code}, function (docs) {
		console.log('Retrieved', docs.length);
		_filterForLine(line, code, docs, lines.length, function (err) {
			if (err) {
				callback(err);
			} else {
				setImmediate(callback);
			}
		});
	}, callback);
}

function _filterForLine(line, code, docs, length, callback) {
	console.log('Filtering by length', docs.length);
	var ans = [];
	async.eachSeries(docs, function(doc, next) {
		var x = {
			remote: doc.remote,
			date: doc.date,
			time: doc.time,
			train: line,
			exits: doc.exits/length,
			entries: doc.entries/length
		};
		ans.push(x);
		setImmediate(next);
	}, function(err) {
		if(err) {
			callback(err);
		} else {
			_saveToMongo(ans, function() {
				ans = [];
				console.log('Successfully saved in mongo for', line, code);
				setImmediate(callback());
			}, callback);
		}
	});
}

function _saveToMongo(docs, success, failure) {
	new trainUsageModel().bulkInsert(docs, success, function(error) {
		console.log(error);
		success();
	});
}

function _getLineForStation(station, callback) {
	new stationModel().retrieve({remote: station}, function(docs) {
		callback(null, docs[0].toObject().line);
	}, callback);
}