'use strict';

var Reflux = require('reflux');

var mapActions = require('../actions/action-map');

var _data;
var _station;

var MapStore = Reflux.createStore({

	listenables: mapActions,

	onNewData: function(data) {
		_data = data;
		this.trigger();
	},

	onSaveStation: function(station) {
		_station = station;
	},

	getData: function() {
		return _data;
	},

	getStation: function() {
		return _station;
	}
});

module.exports = MapStore;