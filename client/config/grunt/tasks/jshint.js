module.exports = {
	options: {
		jshintrc: './jsxhintrc.json',
		reporter: require('jshint-stylish')
	},
	grunt: ['./*.js'],
	config: ['./config/**/*.js'],
	src: ['./src/**/*.jsx', './src/**/*.js'],
	test: {
		options: {
			jshintrc: './jsxhintrc-test.json'
		},
		files: {
			src: ['./test/**/*.js']
		}
	}
};
