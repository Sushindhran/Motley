'use strict';

var _ = require('lodash');
var path = require('path');
var assert = require('assert');
var fs = require('fs');
var async = require('async');
var hbase = require('hbase');
var moment = require('moment');

var settings = require('../config/app/settings');
var db = require('../db/scripts/db');
var trainUsageModel = require('../db/models/model-train-usage').Model;
var monthwiseAvModel = require('../db/models/model-monthwise-usage-av').Model;

var client = new hbase({
	host: '127.0.0.1',
	port: 8080
});

var log;

var trains = [
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'J', 'L', 'M', 'N', 'Q', 'R', 'S', 'Z', '1', '2', '3', '4', '5', '6', '7'
];

/**
 * Function to load the config
 */
var loadConfig = function() {
	var env = process.env.NODE_ENV || 'development',
		configPath = path.resolve(__dirname, '../../config'),
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
		_fetchAndSaveDataForAllTrains(done, done);
	}
], function(error) {
	if(error) {
		console.log(error);
	} else {
		process.exit(0);
	}
});

function _fetchAndSaveDataForAllTrains(success, failure) {

	async.eachSeries(trains, function(train, next) {
		_fetchAllForStation(train, function(error, docs) {
			if(error) {
				next(error);
			} else {
				console.log('Saving to mongo for', train);
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
	console.log('Fetching from train usage data for', code);
	var res = [],
		years = [2010, 2011, 2012, 2013, 2014, 2015];

	async.eachSeries(years, function(y, next) {
		console.log('Fetching for year', y);
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
		console.log('Fetching for month', m);
		new trainUsageModel().retrieve({train: code, date: {"$gte": new Date(year, m, 1), "$lt": new Date(year, m+1, 1)}}, function(docs) {
			_consolidateForOneMonth(code, m, year, docs, function(ans) {
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

function _consolidateForOneMonth(code, month, year, arr, callback) {
	var ans = [];
	if(arr.length > 1) {
		var x = {
			train: code,
			month: month,
			year: year,
			entries: arr[0].entries,
			exits: arr[0].exits
		};

		ans.push(x);

		var entries = 0,
			exits = 0;
		async.eachSeries(arr, function(arr, next) {
			ans[0].entries = Number(ans[0].entries) + Number(_.get(arr, 'entries'));
			ans[0].exits = Number(ans[0].exits)  + Number(_.get(arr, 'exits'));
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
	new monthwiseAvModel().bulkInsert(docs, success, function(error) {
		console.log(error);
		success();
	});
}