'use strict';

var path = require('path'),
	expressSession = require('express-session'),
	bodyParser = require('body-parser'),
	settings = require('../app/settings');

module.exports = function(app, router) {
	// for parsing application/json
	app.use(bodyParser.json({limit: '5mb'}));

	// for parsing application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({ extended: true }));

	app.use('/api', router);
};

