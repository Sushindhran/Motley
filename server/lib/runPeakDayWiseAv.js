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
var daywiseAvModel = require('./db/models/model-peakDay-av').Model;

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
	console.log('Fetching from turnstileDatas for', code);
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
	var months = [1,2,3,4,5,6,7,8,9,10,11,12],
		res = [];

	async.eachSeries(months, function(m, next) {
		new turnstileModel().retrieve({remote: code, date: {"$gte": new Date(year, m, 1), "$lt": new Date(year, m+1, 1)}}, function(docs) {
			_consolidateForOneMonthByDay(code, m, year, docs, function(ans) {
				res = _.union(res, ans);
				setImmediate(next);
			});
		}, next);
	}, function(error) {
		if(error) {
			callback(error);
		} else {
			callback(null, res);
		}
	});
}

function _consolidateForOneMonthByDay(code, month, year, arr, callback) {
	var ans = [];

	if(arr.length > 1) {
		var x = {
			remote: code,
			month: month,
			year: year,
			entries: 0,
			exits: 0
		};
		for(var i=0;i<7;i++) {
			var z = _.assign({},x);
			z.day = i;
			ans.push(z);
		}
		async.eachSeries(arr, function(a, next) {
			if(a.toObject().time >=7 && a.toObject().time<=10) {
				var day = new Date(a.toObject().date).getDay();
				ans[day].entries = Number(ans[day].entries) + Number(_.get(a, 'entries'));
				ans[day].exits = Number(ans[day].exits) + Number(_.get(a, 'exits'));
			}
			setImmediate(next);
		}, function(err) {
			if(err) {
				callback(err);
			} else {
				callback(ans);
			}
		});
	} else {
		callback(arr);
	}
}

function _saveToMongo(docs, success, failure) {
	//console.log(docs);
	new daywiseAvModel().bulkInsert(docs, success, function(error) {
		console.log(error);
		success();
	});
}