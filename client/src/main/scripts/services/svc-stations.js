'use strict';

var Q = require('q');
var $ = require('jquery');

var Endpoints = require('../constants/endpoints');

function Stations() { }

Stations.getCaptionResponse = function() {
	return Q.promise(function(resolve, reject) {
		$.get(Endpoints.STATIONS.URL)
			.success(function(response) {
				resolve(response);
			}).error(function(error) {
				reject(error.responseJSON);
			});
	});
};

module.exports = Stations;