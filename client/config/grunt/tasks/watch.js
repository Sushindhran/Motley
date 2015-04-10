module.exports = {
	sass: {
		files: ['src/main/resources/styles/**/*'],
		tasks: ['sass:compile']
	},
	scripts: {
		files: ['src/main/scripts/**/*'],
		tasks: ['browserify:compile']
	}
};
