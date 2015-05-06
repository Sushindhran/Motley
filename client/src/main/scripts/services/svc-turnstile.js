'use strict';

var Q = require('q');
var $ = require('jquery');

var Endpoints = require('../constants/endpoints');

function Turnstiles() { }

Turnstiles.getCaptionResponse = function(date, time) {
	return Q.promise(function(resolve, reject) {
		$.get(Endpoints.TRAIN_USAGE.URL.replace(':date', date).replace(':time', time))
			.success(function(response) {
				resolve(response);
			}).error(function(error) {
				reject(error.responseJSON);
			});
	});
};

module.exports = Turnstiles;