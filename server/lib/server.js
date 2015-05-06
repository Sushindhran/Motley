'use strict';

var path = require('path'),
	fs = require('fs'),
	async = require('async'),
	express = require('express'),
	settings = require('./config/app/settings'),
	app = express(),
	router = express.Router(),
	db = require('./db/scripts/db'),
	middleware = require('./config/express/express-middleware'),
	routes = require('./config/express/express-routes'),
	log4js = require('log4js'),
	_ = require('lodash'),
	server,
	log;

/**
 * Listens on a port
 */
exports.listen = function () {
	server = app.listen.apply(app, arguments);
};

/**
 * Function to load the config
 */
var loadConfig = function() {
	var env = process.env.NODE_ENV || 'development',
		configPath = path.resolve(__dirname, '../config'),
		configFile = path.join(configPath + '/', env + '.json'),
		config = fs.readFileSync(configFile, 'utf8');
	settings.setConfig(config);
};

/**
 * Function that starts the server and listens on a port.
 */
var runServer = function() {
	var port = settings.getConfig().port;

	//Start listening on localhost
	exports.listen(port);
	settings.log.info('Node app listening on port %d', port);
};

/**
 * Block that runs when this script is executed.
 */
async.series([
	function(done) {
		loadConfig();
		done();
	},
	function(done) {
		log = getLogger();
		settings.log = log;
		done();
	},
	function(done) {
		db.connect(settings.getConfig().dbURL, done, done);
	},
    function(done) {
        middleware(app, router);
        done();
    },
    function(done) {
        routes(router);
        done();
    },
	function(done) {
		runServer();
		done();
	}
], function(error) {
	if(error !== undefined) {
		log.fatal(error);
	}
});

function getLogger() {
	var config = settings.getConfig(),
		category = _.get(config, 'logging.appenders[0].category'),
		type = _.get(config, 'logging.appenders[0].type'),
		filename;

	if(type === 'file') {
		var logPath = path.join(__dirname.split('lib')[0], 'logs');
		if(!fs.existsSync(logPath)) {
			fs.mkdirSync(logPath);
		}
		filename = _.get(config, 'logging.appenders[0].filename', 'production.log');
		//Set the log file path to the absolute path
		config.logging.filename = path.join(__dirname.split('lib')[0], filename);
	}
	log4js.configure(config.logging, {});
	return log4js.getLogger(category);
}