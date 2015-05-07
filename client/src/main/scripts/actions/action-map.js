'use strict';

var Reflux = require('reflux');

var MapActions = Reflux.createActions([
	'newData',
	'saveStation',
	'newAnalytic'
]);

module.exports = MapActions;