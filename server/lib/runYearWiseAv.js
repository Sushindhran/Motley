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
var monthwiseAvModel = require('./db/models/model-monthwise-av').Model;
var yearwiseAvModel = require('./db/models/model-yearwise-av').Model;

var client = new hbase({
	host: '127.0.0.1',
	port: 8080
});

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
		_fetchAndSaveDataForAllStations(done, done);
	}
], function(error) {
	if(error) {
		console.log(error);
	} else {
		process.exit(0);
	}
});

function _fetchAndSaveDataForAllStations(success, failure) {

	async.eachSeries(stations, function(station, next) {
		var stationCode = _.findKey(station);
		_fetchAllForStation(stationCode, function(error, docs) {
			if(error) {
				next(error);
			} else {
				console.log('Saving to mongo for', stationCode);
				_saveToMongo(docs, next, next);
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

function _fetchAllForStation(code, callback) {
	console.log('Fetching for', code);
	var res = [],
		years = [2010, 2011, 2012, 2013, 2014, 2015];

	async.eachSeries(years, function(y, next) {
		_fetchForYear(code, y, function(err, docs) {
			if(err) {
				next(err);
			} else {
				res = _.union(res, docs);
				setImmediate(next);
			}
		});
	}, function(error) {
		if(error) {
			callback(error);
		} else {
			callback(null, res);
		}
	});
}

function _fetchForYear(code, year, callback) {
	new monthwiseAvModel().retrieve({remote: code}, function(docs) {
		_consolidateForOneYear(code, year, docs, callback);
	}, callback);
}

function _consolidateForOneYear(code, year, arr, callback) {
	var ans = [];
	if(arr.length > 1) {
		var x = {
			remote: code,
			year: year,
			entries: arr[0].entries,
			exits: arr[0].exits
		};

		ans.push(x);

		var entries = 0,
			exits = 0;
		async.eachSeries(arr, function(a, next) {
			if(year === Number(a.year)) {
				ans[0].entries = Number(ans[0].entries) + Number(_.get(a, 'entries'));
				ans[0].exits = Number(ans[0].exits) + Number(_.get(a, 'exits'));
			}
			setImmediate(next);
		}, function(err) {
			if(err) {
				callback(err);
			} else {
				ans[0].exits = ans[0].exits/ (30*12);
				ans[0].entries = ans[0].entries/ (30*12);
				callback(null, ans);
			}
		});
	} else {
		callback(null, arr);
	}
}

function _saveToMongo(docs, success, failure) {
	new yearwiseAvModel().bulkInsert(docs, success, function(error) {
		console.log(error);
		success();
	});
}