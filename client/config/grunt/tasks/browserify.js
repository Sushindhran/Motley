module.exports = {
	//Pertains to the browserify task
	compile: {
		debug: true,
		options: {
			transform: [ 'reactify' ]
		},
		files: {
			'target/scripts/bundle.js': ['src/main/scripts/**/*.js', 'src/main/scripts/**/*.jsx'],
			'target/scripts/vendor.js': [
				'node_modules/jquery/dist/jquery.min.js',
				'src/main/lib/**/*.js'
			]
		}
	}
};
