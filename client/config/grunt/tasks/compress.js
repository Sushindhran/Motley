module.exports = {
	main: {
		options: {
			archive: 'Scene-Finder-client.zip',
			mode: 'zip'
		},
		files: [
			{
				expand: true,
				cwd: 'deployment/',
				src: ['**'],
				dest: './'
			}
		]
	}
};