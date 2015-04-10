module.exports = {
	compile: {
		options: {
			sourceMap: true
		},
		files: [{
			expand: true,
			cwd: 'src/main/resources/styles/',
			src: ['**/*.scss'],
			dest: 'target/resources/css',
			ext: '.css'
		}]
	}
};
