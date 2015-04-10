module.exports = {
	deploy: {
		options: {
			mangle: true
		},
		files: {
			'deployment/scripts/bundle.min.js': ['target/scripts/bundle.js'],
			'deployment/scripts/vendor.min.js': ['target/scripts/vendor.js']
		}
	}
};
