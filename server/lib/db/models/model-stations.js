'use strict';

var _ = require('lodash'),
	util = require('util'),
	moment = require('moment'),
	async = require('async'),
	baseModel = require('./model-base'),
	Schemas = require('../schemas').Schemas,
	stationSchema = Schemas.station,
	station;

/**
 * Constructor for the user model
 */
function Station() {
	Station.super_.call(this);
	Station.prototype.init('station', stationSchema);
}

util.inherits(Station, baseModel.Model);

station = Station.prototype;

station.bulkInsert = function(arr, success, failure) {

	this.mongooseModel.collection.insert(arr, function(err, docs) {
		if(err) {
			failure(err);
		} else {
			console.log('Inserted', docs.length, 'records');
			success();
		}
	});
};

exports.Model = Station;