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

var client = new hbase({
	host: '127.0.0.1',
	port: 8080
});

var filenameSuffixes = [
	/*'100505', '100508', '100515', '100522',
	'100605', '100612', '100619', '100626',
	'100703', '100710', '100717', '100724',
	'100731', '100807', '100814', '100821',
	'100828',*/ '100904', '100911', '100918',
	'100925', '101002', '101009', '101016',
	'101023', '101030', '101106', '101113',
	'101120', '101127', '101204', '101211',
	'101218', '101225', '110101', '110108',
	'110115', '110122', '110129', '110205',
	'110212', '110219', '110226', '110305',
	'110312', '110319', '110326', '110402',
	'110409', '110416', '110423', '110430',
	'110507', '110514', '110521', '110528',
	'110604', '110611', '110618', '110625',
	'110702', '110709', '110716', '110723',
	'110730', '110806', '110813', '110820',
	'110827', '110903', '110910', '110917',
	'110924', '111001', '111008', '111015',
	'111022', '111029', '111105', '111112',
	'111119', '111126', '111203', '111210',
	'111219', '111224', '111231', '120107',
	'120114', '120121', '120128', '120204',
	'120211', '120218', '120225', '120303',
	'120310', '120317', '120324', '120331',
	'120407', '120414', '120421', '120428',
	'120505', '120512', '120519', '120526',
	'120602', '120609', '120616', '120623',
	'120630', '120707', '120714', '120721',
	'120728', '120804', '120811', '120818',
	'120825', '120901', '120908', '120915',
	'120922', '120929', '121006', '121013',
	'121020', '121027', '121103', '121110',
	'121117', '121124', '121201', '121208',
	'121215', '121222', '121229', '130105',
	'130112', '130119', '130126', '130202',
	'130209', '130216', '130223', '130302',
	'130309', '130316', '130323', '130330',
	'130406', '130413', '130420', '130427',
	'130504', '130511', '130518', '130525',
	'130601', '130608', '130615', '130622',
	'130629', '130706', '130713', '130720',
	'130727', '130803', '130810', '130817',
	'130824', '130831', '130907', '130914',
	'130921', '130928', '131005', '131012',
	'131019', '131026', '131102', '131109',
	'131116', '131123', '131130', '131207',
	'131214', '131221', '131228', '140104',
	'140111', '140118', '140125', '140201',
	'140208', '140215', '140222', '140301',
	'140308', '140315', '140322', '140329',
	'140405', '140412', '140419', '140426',
	'140503', '140510', '140517', '140524',
	'140531', '140607', '140614', '140621',
	'140628', '140705', '140712', '140719',
	'140726', '140802', '140809', '140816',
	'140823', '140830', '140906', '140913',
	'140920', '140927', '141004', '141011',
	'141018', '141025', '141101', '141108',
	'141115', '141122', '141129', '141206',
	'141213', '141220', '141227', '150103',
	'150110', '150117', '150124', '150131',
	'150207', '150214', '150221', '150228',
	'150307', '150314', '150321', '150328',
	'150404', '150411', '150418', '150425'
];

async.series([
	/*function(done1) {
		//Create hbase table
		client.table('mta_turnstile_data')
			.create({
				ColumnSchema: [
					{ name: 'logDetails' }
				]
			}, function(error, success) {
				if(error) {
					done1(error);
				} else {
					success ? console.log('Table created.') : console.log('Table not created.');
					done1();
				}
			});
	},*/
	function(done1) {
		/**
		 * Uncomment to view schema after table is created.
		 */
		client.table('mta_turnstile_data')
			.schema(function(error, schema){
				console.log(schema);
				done1();
			});
	},
	/*function(done1) {
		var row = 'R070,ST. GEORGE,,,04-23-10,08:00:00,REGULAR,001344973,000008753,40.643738,-74.073622',
			rowSplit = row.split(',');

		_saveRow('boo', rowSplit, done1);
	},*/
	function(done1) {
		async.eachSeries(filenameSuffixes,
			function(suffix, next) {
				var _data;
				async.series([
					function(done) {
						//Fetch data for this file from the mta website
						_fetchData(suffix, function(data) {
						    _data = data;
							done();
						 }, done);
					},
					function(done) {
						_dumpFileContentsIntoHBase(suffix, _data, done);
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
				if(error) {
					done1(error);
				} else {
					done1();
				}
			}
		);
	}
], function(error) {
	if (error) {
		console.log(error);
	} else {
		console.log('Successfully pulled data from MTA and dumped it into HBase');
	}
});


/**
 * Helper function to fetch data from the mta website
 * @param suffix
 * @param success
 * @param failure
 * @private
 */
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
 * Parsing and saving data into hbase
 * @param suffix
 * @param data
 * @param callback
 * @private
 */
function _dumpFileContentsIntoHBase(suffix, data, callback) {
	var split = data.split('\n'),
		count = 1;

	split = _.slice(split, 1, split.length-1);

	async.eachSeries(split, function(row, next) {
		var rowSplit = row.split(',');

		_saveRow(suffix, rowSplit, function(error) {
			if(error) {
				next(error);
			} else {
				count++;
				next();
			}
		});
	}, function(error) {
		if(error) {
			callback(error);
		} else {
			console.log('Successfully inserted', count, 'entries from file:', suffix);
			callback();
		}
	});
}

/**
 * Saving row to hbase
 * @param suffix
 * @param row
 * @param callback
 * @private
 */
function _saveRow(suffix, row, callback) {
	var table = client.table('mta_turnstile_data'),
		rowKey = row[0] + '_' + row[4] + '_' + row[5],
		rows = [
			{ key: rowKey, column: 'logDetails:description', timestamp: Date.now(), $: row[6] },
			{ key: rowKey, column: 'logDetails:entries', timestamp: Date.now(), $: row[7] },
			{ key: rowKey, column: 'logDetails:exits', timestamp: Date.now(), $: row[8] }
		];

	table.row()
		.put(rows, function(error, success){
			if(error) {
				callback(error);
			} else {
				if(success) {
					console.log('Inserted row', rowKey);
					callback();
				} else {
					callback(new Error('Insert into Hbase failed for file' + suffix));
				}
			}
		});
}
