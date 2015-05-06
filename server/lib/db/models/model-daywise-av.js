'use strict';

var _ = require('lodash'),
	util = require('util'),
	moment = require('moment'),
	async = require('async'),
	baseModel = require('./model-base'),
	Schemas = require('../schemas').Schemas,
	dayWiseAvSchema = Schemas.dayWiseAverage,
	daywiseAvModel;

/**
 * Constructor for the user model
 */
function DayWiseAvModel() {
	DayWiseAvModel.super_.call(this);
	DayWiseAvModel.prototype.init('dayWiseAverage', dayWiseAvSchema, 'dayWiseAverage');
}

util.inherits(DayWiseAvModel, baseModel.Model);

daywiseAvModel = DayWiseAvModel.prototype;

daywiseAvModel.bulkInsert = function(arr, success, failure) {

	this.mongooseModel.collection.insert(arr, function(err, docs) {
		if(err) {
			failure(err);
		} else {
			console.log('Inserted', docs.length, 'records');
			success();
		}
	});
};

exports.Model = DayWiseAvModel;