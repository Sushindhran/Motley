'use strict';

var Q = require('q');
var $ = require('jquery');

var Endpoints = require('../constants/endpoints');

function Analytics() { }

Analytics.getAnalytics = function(analytic, station) {
	return Q.promise(function(resolve, reject) {
		$.get(Endpoints.ANALYTICS.URL.replace(':analytic', analytic).replace(':station', station))
			.success(function(response) {
				resolve(response);
			}).error(function(error) {
				reject(error.responseJSON);
			});
	});
};

module.exports = Analytics;