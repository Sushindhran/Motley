'use strict';

var _ = require('lodash'),
	util = require('util'),
	moment = require('moment'),
	async = require('async'),
	baseModel = require('./model-base'),
	Schemas = require('../schemas').Schemas,
	monthwiseAvSchema = Schemas.monthWiseAverage,
	monthwiseAvModel;

/**
 * Constructor for the user model
 */
function MonthwiseAvModel() {
	MonthwiseAvModel.super_.call(this);
	MonthwiseAvModel.prototype.init('monthwiseAv', monthwiseAvSchema);
}

util.inherits(MonthwiseAvModel, baseModel.Model);

monthwiseAvModel = MonthwiseAvModel.prototype;

monthwiseAvModel.bulkInsert = function(arr, success, failure) {

	this.mongooseModel.collection.insert(arr, function(err, docs) {
		if(err) {
			failure(err);
		} else {
			console.log('Inserted', docs.length, 'records');
			success();
		}
	});
};

exports.Model = MonthwiseAvModel;