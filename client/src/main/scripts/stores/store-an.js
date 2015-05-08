'use strict';

var Reflux = require('reflux');

var analyticActions = require('../actions/action-an');

var _analyType;

var AnalyStore = Reflux.createStore({

	listenables: analyticActions,

	onType: function(type) {
		_analyType =type;
		this.trigger();
	},

	getType: function() {
		return _analyType;
	}
});

module.exports = AnalyStore;