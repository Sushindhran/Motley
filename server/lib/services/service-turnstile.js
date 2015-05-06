'use strict';

var _ = require('lodash');
var fs = require('fs');
var async = require('async');
var path = require('path');
var moment = require('moment');

var turnstileModel = require('../db/models/model-turnstile').Model;

exports.getDataByTimeAndDate = function(date, time, success, failure){
	date = moment(date).toDate();
	_fetchDataForAllStations(date, time, success, failure);
};

function _fetchDataForAllStations(date, time, success, failure) {
	var res = [];
	var stationDataPath = path.join(__dirname, '../data/stations.json');
	var stations = JSON.parse(fs.readFileSync(stationDataPath));
	async.each(stations, function(station, next) {
		var stationCode = _.findKey(station),
			stationDet = station[stationCode];

		new turnstileModel().retrieve({remote: stationCode, time:time, date: date}, function(docs) {
			_consolidateForOneStation(stationDet, docs, function(ans) {
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

function _consolidateForOneStation(stationDet, arr, callback) {
	var ans = [];
	if(arr.length >= 1) {
		var x = arr[0].toObject();

		var entries = 0,
			exits = 0;
		async.eachSeries(arr, function(arr, next) {
			x.entries = Number(x.entries) + Number(_.get(arr, 'entries'));
			x.exits = Number(x.exits) + Number(_.get(arr, 'exits'));
			x.lat = stationDet.latitude;
			x.lng = stationDet.longitude;
			ans[0] = x;
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