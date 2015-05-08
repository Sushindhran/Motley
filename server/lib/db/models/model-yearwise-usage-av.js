'use strict';

var _ = require('lodash'),
	util = require('util'),
	moment = require('moment'),
	async = require('async'),
	baseModel = require('./model-base'),
	Schemas = require('../schemas').Schemas,
	yearWiseAvSchema = Schemas.yearWiseUsageAverage,
	yearwiseAvModel;

/**
 * Constructor for the user model
 */
function YearwiseAvModel() {
	YearwiseAvModel.super_.call(this);
	YearwiseAvModel.prototype.init('yearwiseUsageAv', yearWiseAvSchema);
}

util.inherits(YearwiseAvModel, baseModel.Model);

yearwiseAvModel = YearwiseAvModel.prototype;

yearwiseAvModel.bulkInsert = function(arr, success, failure) {

	this.mongooseModel.collection.insert(arr, function(err, docs) {
		if(err) {
			failure(err);
		} else {
			console.log('Inserted', docs.length, 'records');
			success();
		}
	});
};

exports.Model = YearwiseAvModel;