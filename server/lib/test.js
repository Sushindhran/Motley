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
		console.log('Retrieve test');
		var date = moment('2010-05-22').toDate();
		_fetchDataForAllStations(date, 11, function(res) {
			console.log(res);
			done();
		}, done);
	},
	function(done) {

	}
], function(error) {
	if(error) {
		console.log(error);
	} else {
		console.log('Save success');
		process.exit(0);
	}
});

function _fetchDataForAllStations(date, time, success, failure) {
	var res = [];
	async.each(stations, function(station, next) {
		var stationCode = _.findKey(station);

		new turnstileModel().retrieve({remote: stationCode, time:time, date: date}, function(docs) {
			_consolidateForOneStation(docs, function(ans) {
				res = _.union(res, ans);
				next();
			});
		}, next);
	}, function(error) {
		if(error) {
			failure(error);
		} else {
			success(res);
		}
	});
}

function _consolidateForOneStation(arr, callback) {
	var ans = [];
	if(arr.length > 1) {
		ans.push(arr[0]);
		var entries = 0,
			exits = 0;
		async.eachSeries(arr, function(arr, next) {
			ans[0].entries += Number(_.get(arr, 'entries'));
			ans[0].exits += Number(_.get(arr, 'exits'));
			next();
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
