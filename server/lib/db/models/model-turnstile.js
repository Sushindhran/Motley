'use strict';

var _ = require('lodash'),
	util = require('util'),
	moment = require('moment'),
	async = require('async'),
	baseModel = require('./model-base'),
	Schemas = require('../schemas').Schemas,
	turnstileSchema = Schemas.turnstileData,
	turnstileModel;

/**
 * Constructor for the user model
 */
function TurnstileModel() {
	TurnstileModel.super_.call(this);
	TurnstileModel.prototype.init('turnstileData', turnstileSchema, 'turnstileData');
}

util.inherits(TurnstileModel, baseModel.Model);

turnstileModel = TurnstileModel.prototype;

/**
 * Function that inserts/updates specified document in the user collection.
 * @param item
 * @param success
 * @param failure
 * @private
 */
turnstileModel.insertOrUpdate = function(item, success, failure) {
	console.log('Inserting ', item);
	//Ensuring that the date is in a consistent format
	if(item.date.length === 8) {
		item.date = moment(item.date, 'MM-DD-YY');
	} else {
		item.date = moment(item.date, 'MM-DD-YYYY');
	}

	item.time = item.time.split(':')[0];

	async.series([
		function(done) {
			turnstileModel.update(item, { remote: item.remote, date: item.date, time: item.time }, null, done, done);
		}
	], function(error) {
		if(error !== undefined) {
			failure(error);
		} else {
			success();
		}
	});
};

turnstileModel.bulkInsert = function(arr, success, failure) {
	_cleanArr(arr, function(err) {
		if(err  instanceof Error) {
			failure(err);
		} else {
			this.mongooseModel.collection.insert(arr, function(err, docs) {
				if(err) {
					failure(err);
				} else {
					success();
				}
			});
		}
	}.bind(this));
};

function _cleanArr(arr, callback) {
	async.each(arr,
		function(a, next) {
			if(a.date.length === 8) {
				a.date = moment(a.date, 'MM-DD-YY').toDate();
			} else {
				a.date = moment(a.date, 'MM-DD-YYYY').toDate();
			}
			a.time = a.time.split(':')[0];
			next();
		},
		function(err) {
			if(err) {
				callback(new Error(err));
			} else {
				callback(arr);
			}
		}
	);
}
exports.Model = TurnstileModel;
