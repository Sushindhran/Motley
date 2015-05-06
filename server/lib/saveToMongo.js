'use strict';

var _ = require('lodash');
var path = require('path');
var assert = require('assert');
var fs = require('fs');
var async = require('async');
var hbase = require('hbase');

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
		console.log('Starting save process');
		start(done);
	}
], function(error) {
	if(error) {
		console.log(error);
	} else {
		console.log('Save success');
	}
});

function start(callback) {
	async.eachSeries(stations, function (station, next) {
		var stationCode = _.findKey(station);

		//Async block to store data in mongodb
		async.waterfall([
			function (done) {
				_fetchDataBasedOnStation(stationCode, function(err, data) {
					if(err) {
						next();
					} else {
						done(err, data);
					}
				});
			},
			function (values, done) {
				console.log('Fetched for', stationCode, 'from hbase.');
				//Save values to mongo
				_saveToMongo(station, values, done);
			}
		], function (error) {
			if (error) {
				next(error);
			} else {
				next();
			}
		});
	}, function (error) {
		if (error) {
			callback(error);
		} else {
			callback();
		}
	});
}

function _saveToMongo(station, values, callback) {
	var remote = _.findKey(station),
		toInsert = [];

	async.eachSeries(values,
		function(value, next) {
			var rowkey = value.key.toString(),
				rowSplit = rowkey.split('_');

			assert.equal(rowSplit[0], remote);

			var description = '', entries = 0, exits = 0;

			if(value.column.toString() === 'logDetails:description') {
				description = value.$.toString();
			}

			if(value.column.toString() === 'logDetails:entries') {
				entries = Number(value.$.toString());
			}

			if(value.column.toString() === 'logDetails:exits') {
				exits = Number(value.$.toString());
			}

			var item = {
				remote: remote,
				date: rowSplit[1],
				time: rowSplit[2],
				description: description,
				entries: entries,
				exits: exits
			};

			toInsert.push(item);
			if(toInsert.length === 1000) {
				new turnstileModel().bulkInsert(toInsert, function() {
					toInsert = [];
					setImmediate(next);
				}, next);
			} else {
				setImmediate(next);
			}
			//new turnstileModel().insertOrUpdate(item, next, next);
		},
		function(error) {
			if(error) {
				callback(error);
			} else {
				console.log('Bulk insert complete for', remote);
				new turnstileModel().bulkInsert(toInsert, callback, callback);
			}
		}
	);
}

function _fetchDataBasedOnStation(station, callback) {
	client.table('mta_turnstile_data')
		.row(station+'_*')
		.get('logDetails', callback);
}