
module.exports = function(grunt) {
	var browsers = ['PhantomJS'],
		browserOptions=grunt.option('browsers'),
		reporterOptions=grunt.option('reporter');

	return {
		unit: {
			configFile: 'config/karma/karma.conf.js',

			//override by using:  grunt --browsers=Chrome,Safari,etc... otherwise default to phantomjs
			browsers: browserOptions? browserOptions.split(',') : browsers,

			//set target type of coverage report:  grunt --reporter=corbertura
			coverageReporter: {
				type: reporterOptions? reporterOptions : 'html',
				dir: '../../../coverage/'
			}
		}
	};
};