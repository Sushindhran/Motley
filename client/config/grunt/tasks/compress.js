module.exports = {
	main: {
		options: {
			archive: 'House-hunting-application.zip',
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