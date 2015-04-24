'use strict';

var async = require('async'),
	mongoose = require('mongoose'),
	settings = require('../config/app/settings');

exports.getExitsBytime = function(time, success, failure){
	mongoose.retrieve({time: time}, function(docs) {
		success(docs);
	}, failure);
};


exports.getEntriesBytime = function(time, success, failure){
	mongoose.retrieve({time: time}, function(docs) {
		success(docs);
	}, failure);
};