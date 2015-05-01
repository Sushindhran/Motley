'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var async = require('async');
var assert = require('assert');
var hbase = require('hbase');

var client = new hbase({
	host: '127.0.0.1',
	port: 8080
});

var stationDataPath = path.join(__dirname, './data/stations.json');
var stations = JSON.parse(fs.readFileSync(stationDataPath));

/*async.eachSeries(stations, function(station, next) {
	var stationCode = _.findKey(station);
	_fetchDataBasedOnStation(stationCode, next);
}, function(error) {
	if(error) {
		console.log(error);
	} else {
		console.log('Success');
	}
});*/

/*async.series([
	function(done) {
		//Fetch data based on station from HBASE
		_fetchDataBasedOnStation();
	},
	function(done) {

	},
	function(done) {

	}
], function(error) {
	if(error) {
		console.log(error);
	} else {
		console.log('Successfully inserted values into mongo.')
	}
});*/


client.table('mta_turnstile_data')
	.scan({
		maxVersions: 1,
		batch: 500000
	}, function(error, rows) {
		if(error) {
			console.log(error);
		} else {
			console.log(rows.length)
		}
	});


function _fetchDataBasedOnStation(station, callback) {
	client.table('mta_turnstile_data')
		.row(station+'*')
		.get('coordinates', function(error, values){
			if(error) {
				callback(error);
			} else {
				_.forEach(values, function(value) {
					console.log(value.$.toString(), value.column.toString());
				});
				callback();
			}
		});

}
