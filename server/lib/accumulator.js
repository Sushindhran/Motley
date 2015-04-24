/**
 * The accumulator pulls turnstile data from the mta website
 * and parses, stores it in hive.
 */

var async = require('async');
var _ = require('lodash');
var turnstiles = require('mta-turnstiles');

var assert = require('assert');
var hbase = require('hbase');
var mongoose = require('mongoose');

var client = new hbase.Client({
	host: '127.0.0.1',
	port: 8080
});

async.series([
	function(done) {
		console.log('Here');
		// Execute query

	}
], function(error) {
	if(error) {
		console.log(error);
	} else {
		console.log('Success!');
	}
});


var filenameSuffixes = [
	'100505',
	'100508',
	'100515',
	'100522',
	'100605',
	'100612',
	'100619',
	'100626',
	'100703',
	'100710',
	'100717',
	'100724',
	'100731',
	'100807',
	'100814',
	'100821',
	'100828',
	'100904',
	'100911',
	'100918',
	'100925'
];

async.each(filenameSuffixes,
	function(suffix, next) {
		async.series([
			function(done) {
				//Fetch data for this file from the mta website
				_fetchData(suffix, done, done);
			},
			function(done) {
				//Dump the data into hive
				client.table('mta_data' )
					.create('mta_column_family', function(err, success){
						this.row(suffix)
							.put(col, 'col value', function(err, success){
								this.get('my_column_family', function(err, cells){
									this.exists(function(err, exists){
										assert.ok(exists);
									});
								});
							});
					});
				done();
			},
			function(done) {
				_dumpIntoMongo(done, done);
			}
		], function(error) {
			if(error) {
				next(error);
			} else {
				next();
			}
 		});
	},
	function(error) {
		if (error) {
			console.log(error);
		} else {
			console.log('Successfully pulled data from MTA and dumped it into HBase and then stored it in mongo in a usable format');
		}
	}
);



function _fetchData(suffix, success, failure) {
	var baseUrl = 'http://web.mta.info/developers/data/nyct/turnstile/turnstile_';

	try {
		turnstiles(baseUrl + suffix + '.txt', function (data) {
			success(data);
		});
	} catch(error) {
		failure(error);
	}
}

/**
 *
 * @param day - day of the week
 * @param time
 * @private
 */
function _dumpIntoMongo() {
	//Form analytics to check how many people are entering a particular subway station at a particular time of the day.
	var scanner = client.table('mta_data')
		.scan({
			startRow: filenameSuffixes[0],
			maxVersions: 1
		}),
		rows;

	scanner.on('readable', function(){
		while(chunk = scanner.read()){
			rows.push(chunk);
		}
	});
	scanner.on('error', function(err){
		console.log(err);
	});
	scanner.on('end', function(){
		mongoose.save(rows);
	});
}