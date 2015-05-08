'use strict';

var Q = require('q');
var $ = require('jquery');

var Endpoints = require('../constants/endpoints');

function Analytics() { }

Analytics.getAnalytics = function(analytic, train) {
	return Q.promise(function(resolve, reject) {
		$.get(Endpoints.USAGE.URL.replace(':analytic', analytic).replace(':train', train))
			.success(function(response) {
				resolve(response);
			}).error(function(error) {
				reject(error.responseJSON);
			});
	});
};

module.exports = Analytics;
