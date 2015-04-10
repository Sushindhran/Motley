var initGruntConfig = require('./config/grunt/config');

module.exports = function (grunt) {
	var config = { pkg: grunt.file.readJSON('package.json'), root: true};
	initGruntConfig(grunt, __dirname, config);

	grunt.registerTask('verify', [
		'shell:npmInstall'
	]);

	grunt.registerTask('clean', [
		'shell:cleanTarget',
		'shell:cleanDeployment'
	]);

	grunt.registerTask('compile', [
		'sass:compile',
		'browserify:compile',
		'copy:browser'
	]);

	grunt.registerTask('test', [
		'karma:unit'
	]);

	grunt.registerTask('build', [
		'uglify:deploy',
		'htmlrefs:deploy',
		'copy:deploy'
	]);

	/* Deployment task that creates a zip */
	grunt.registerTask('deployment', 'Creates a zip artifact for deployment', function() {
		grunt.task.run([
			'verify',
			'clean',
			'compile',
			'jshint',
			'test',
			'build',
			'compress'
		]);
	});

	/* Watch task that bundles(browserify) on the fly as you make changes to files */
	grunt.registerTask('watchify', [
		'watch:scripts',
		'watch:sass'
	]);

	/* Nginx Tasks */
	grunt.registerTask('restart', [
		'shell:testNginx',
		'shell:testPkill',
		'shell:startNginx'
	]);

	grunt.registerTask('stop', [
		'shell:testPkill',
		'shell:rmSymLink',
		'shell:stopNginx'
	]);

	/* Default task that compiles everything for dev */
	grunt.registerTask('default', [
		'verify',
		'clean',
		'compile',
		'jshint',
		'test'
	]);

	/* Jenkins Coverage excluding compilation */
	grunt.registerTask('coverage', [
		'verify',
		'jshint',
		'test'
	]);
};
