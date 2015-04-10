module.exports = {
    browser: {
        files: [
            {
				expand:true,
				cwd:'<%= sourceDirectoryPath %>',
				src:[
					'index.html'
				],
				dest: '<%= buildOutputDirectoryPath %>/'
			},
			{
				expand: true,
				cwd: '<%= sourceDirectoryPath %>/resources/images',
				src:[
					'**/*'
				],
				dest: '<%= buildOutputDirectoryPath %>/resources/images/'
			}
		],
		options: {
			mode: true
		}
	},
	deploy: {
		files: [
			{
				expand:true,
				src: [
					'nginx.conf',
					'mime.types',
					'nginx.sh'
				],
				dest: 'deployment/'
			},
			{
				expand:true,
				cwd: '<%= buildOutputDirectoryPath %>',
				src: [
					'resources/**/*'
				],
				dest: 'deployment/'
			}
		],
		options: {
			mode: true
		}
	}
};
