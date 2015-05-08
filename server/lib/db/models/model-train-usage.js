'use strict';

var _ = require('lodash'),
	util = require('util'),
	moment = require('moment'),
	async = require('async'),
	baseModel = require('./model-base'),
	Schemas = require('../schemas').Schemas,
	trainUsageSchema = Schemas.trainUsage,
	trainUsage;

/**
 * Constructor for the user model
 */
function TrainUsage() {
	TrainUsage.super_.call(this);
	TrainUsage.prototype.init('trainUsage', trainUsageSchema);
}

util.inherits(TrainUsage, baseModel.Model);

trainUsage = TrainUsage.prototype;

trainUsage.bulkInsert = function(arr, success, failure) {

	this.mongooseModel.collection.insert(arr, function(err, docs) {
		if(err) {
			failure(err);
		} else {
			console.log('Inserted', docs.length, 'records');
			success();
		}
	});
};

exports.Model = TrainUsage;