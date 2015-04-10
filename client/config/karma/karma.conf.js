'use strict';

var istanbul = require('browserify-istanbul');

// Karma configuration
module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../../src/main/scripts',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine', 'browserify'],

		//configure browserify
		browserify: {
			debug: true,
			transform: ['reactify'].concat(istanbul({
				ignore: ['**/tests/**']
			})),
			extensions: ['.js', '.jsx'],
			bundleDelay: 2000
		},

		//setting default browser for phantomjs so we can run this config directly in webstorm.
		//when run through grunt, you can override using --browsers=Chrome,Safari,etc...
		browsers: ['PhantomJS'],

		// list of files / patterns to load in the browser
		files: [
			'../../../node_modules/phantomjs-polyfill/bind-polyfill.js',
			'../../../test/karma/**/*-spec.js',
			'../../../test/karma/**/*-spec.jsx'
		],

		//specify browserify preproccessor so we can use server-side components
		preprocessors: {
			'../../../node_modules/react/addons.js': ['browserify'],
			'../../../node_modules/react-tools/src/test/phantomjs-shims.js': ['browserify'],
			'../../../test/karma/**/*.js': ['browserify'],
			'../../../test/karma/**/*.jsx': ['browserify'],
			'../../../test/helpers/**/*.js': ['browserify'],
			'**/*.js' : ['browserify', 'coverage'],
			'**/*.jsx' : ['browserify', 'coverage']
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['coverage', 'progress'],

		coverageReporter: {
			type: 'html',
			dir: '../../../coverage/'
		},

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		singleRun: true,

		rootElementTag: 'body'
	});
};
