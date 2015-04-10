module.exports = {
	cleanTarget: {
		options: {
			callback: function(err, stdout, stderr, cb) {
				console.log("Cleaning the target directory.");
				console.log(stdout);
				console.log(stderr);
				cb();
			}
		},
		command: "rm -r ./target"
	},
	cleanDeployment: {
		options: {
			callback: function(err, stdout, stderr, cb) {
				console.log("Cleaning the deployment directory.");
				console.log(stdout);
				console.log(stderr);
				cb();
			}
		},
		command: "rm -r ./deployment"
	},
	cleanNpm: {
		options: {
			callback: function(err, stdout, stderr, cb) {
				console.log(stdout);
				console.log(stderr);
				cb();
			}
		},
		command: "rm -r node-modules"
	},
	npmInstall: {
		options: {
			callback: function(err, stdout, stderr, cb) {
				console.log(stdout);
				console.log(stderr);
				cb();
			}
		},
		command: "npm install"
	},
	rmSymLink: {
		options: {
			callback: function( err, stdout, stderr, cb ) {
				console.log("Removing the symlinks from /tmp for the nginx host");
				console.log(stdout);
				console.log(stderr);
				cb();
			}
		},
		command: [
			"if [ -L /tmp/<%= pkg.name %> ]; then rm /tmp/<%= pkg.name %>; fi",
		].join('&&')
	},
	startNginx: {
		options: {
			callback: function( err, stdout, stderr, cb ) {
				console.log("Restarting Nginx as sudo - enter your user's password");
				console.log(stdout);
				console.log(stderr);
				cb();
			}
		},
		command: "sudo sh nginx.sh"
	},
	stopNginx: {
		options: {
			callback: function( err, stdout, stderr, cb ) {
				console.log("Stopping Nginx as sudo - enter your user's password");
				console.log(stdout);
				console.log(stderr);
				cb();
			}
		},
		command: "sudo pkill nginx"
	},
	testNginx: {
		options: {
			callback: function (err, stdout, stderr, cb) {
				var output = stdout.split("\n");
				if (output[0] === undefined || output[0] === "") {
					console.log("You need to install nginx");
					console.log("Run command: 'brew install nginx'");
					return false;
				} else {
					console.log("You have nginx installed here: [" + output[0] + "]");
				}
				cb();
			}
		},
		command: "which nginx"
	},
	testPkill: {
		options: {
			callback: function( err, stdout, stderr, cb ) {
				var output = stdout.split("\n");
				if( output[0] === undefined || output[0] === "" ) {
					console.log("You need to install pkill");
					console.log("Run command: 'brew install proctools'");
					return false;
				} else {
					console.log("You have pkill installed here: [" + output[0] + "]");
				}
				cb();
			}
		},
		command: "which pkill"
	}
};
