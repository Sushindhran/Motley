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
var stationModel = require('./db/models/model-stations').Model;

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
	var count = 0;
	async.eachSeries(stations, function(station, next) {
		var stationCode = _.findKey(station);
		var stationItem = station[stationCode];
		var item = {
			remote: stationCode,
			line: stationItem.line,
			lat: stationItem.latitude,
			lng: stationItem.longitude,
			station: stationItem.station
		};
		count++;
		new stationModel().insert(item, next, next);
	}, function(error) {
		if(error) {
			failure(error);
		} else {
			console.log('Inserted', count, 'stations');
			success();
		}
	});
}