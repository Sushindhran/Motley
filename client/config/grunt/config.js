var path = require('path'),
	_ = require('lodash');

module.exports = function (grunt, dirname, config) {
	'use strict';

	var configPath = config.root ? path.join(dirname, 'config/grunt/tasks') : path.join(dirname, '../config/grunt/tasks');
	_.extend(config,
		require('load-grunt-config')(grunt, {
			configPath: configPath,
			overridePath: path.join(dirname, 'tasks'),
			init: false,
			data: {
				name: '<%= pkg.name %>',
				librariesPath: '<%= pkg.paths.libraries %>',
				deploymentDirectoryPath: '<%= pkg.paths.deploymentDirectory %>',
				buildOutputDirectoryPath: '<%= pkg.paths.buildOutputDirectory %>',
				sourceDirectoryPath: '<%= pkg.paths.sourceDirectory %>'
			},
			loadGruntTasks: {
				pattern: 'grunt-*',
				config: require('../../package.json'),
				scope: 'devDependencies'
			}
		})
	);
	grunt.initConfig(config);
};
