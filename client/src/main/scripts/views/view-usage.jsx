var LineChart = require("react-chartjs").Line;
var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');
var storeMap = require('../stores/store-map');
var actionMap = require('../actions/action-map');
var storeAn = require('../stores/store-an');
var actionAn = require('../actions/action-an');
var serviceAnalytics = require('../services/svc-usages');

var _station;
var _response;
var _analyticType = 'avmonthusage';
var _year = 2010;

var _data = {
	labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	datasets: [
		{
			label: "My First dataset",
			fillColor: "rgba(220,220,220,0.2)",
			strokeColor: "rgba(220,220,220,1)",
			pointColor: "rgba(220,220,220,1)",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "rgba(220,220,220,1)",
			data: [65, 59, 80, 81, 56, 55, 40]
		},
		{
			label: "My Second dataset",
			fillColor: "rgba(151,187,205,0.2)",
			strokeColor: "rgba(151,187,205,1)",
			pointColor: "rgba(151,187,205,1)",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "rgba(151,187,205,1)",
			data: [28, 48, 40, 19, 86, 27, 90]
		}
	]
};

var LC = React.createClass({
	mixins: [
		Reflux.listenTo(storeMap, 'onNewAnalytic'),
		Reflux.listenTo(storeAn, 'onAnalyticTypeChange')
	],

	getInitialState: function() {
		return {
			station: storeMap.getStation(),
			data: {
				labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
				datasets: []
			},
			year: '2010',
			analytic: 'avmonthusage',
			type: 'entries'
		};
	},

	componentWillMount: function() {
		if(this.state.station) {
			_station = this.state.station;

			serviceAnalytics.getAnalytics(this.state.analytic, _station).then(
				function(data) {
					_response = data;
					_formatData(this.state.analytic, data, this.state.type, function(error, d) {
						actionMap.newAnalytic(d);
					}.bind(this));
				}.bind(this),
				function(error) {

				}
			);
		}
	},

	onNewAnalytic: function() {
		var analytic = storeMap.getAnalytic();
		this.setState({
			analytic: _analyticType,
			data: analytic
		});
	},

	onTypeChange: function(ev) {
		this.setState({
			type: ev.target.value
		});
		_formatData(this.state.analytic, _response, ev.target.value, function(error, d) {
			actionMap.newAnalytic(d);
		}.bind(this));
	},

	onYearChange: function(ev) {
		this.setState({
			year: ev.target.value
		});
		_year = ev.target.value;
		_formatData(this.state.analytic, _response, this.state.type, function(error, d) {
			actionMap.newAnalytic(d);
		}.bind(this));
	},

	onAnalyticChange: function(ev) {
		actionAn.type(ev.target.value);
	},

	onAnalyticTypeChange: function() {
		var type = storeAn.getType();
		_analyticType = type;
		serviceAnalytics.getAnalytics(type, _station).then(
			function (data) {
				_response = data;
				_formatData(type, _response, this.state.type, function(error, d) {
					actionMap.newAnalytic(d);
				}.bind(this));
			}.bind(this),
			function(error) {

			}
		);
	},

	stationChange: function(ev) {
		_station = ev.target.value || _station;
		serviceAnalytics.getAnalytics(this.state.analytic, _station).then(
			function (data) {
				_response = data;
				_formatData(this.state.analytic, data, this.state.type, function (error, d) {
					actionMap.newAnalytic(d);
				}.bind(this));
			}.bind(this),
			function(error) {

			}
		);
	},

	render: function() {
		var options = {
			animation: true,

			// Number - Number of animation steps
			animationSteps: 5,

			///Boolean - Whether grid lines are shown across the chart
			scaleShowGridLines : true,

			//String - Colour of the grid lines
			scaleGridLineColor : "rgba(0,0,0,.05)",

			//Number - Width of the grid lines
			scaleGridLineWidth : 3,

			//Boolean - Whether to show horizontal lines (except X axis)
			scaleShowHorizontalLines: true,

			//Boolean - Whether to show vertical lines (except Y axis)
			scaleShowVerticalLines: true,

			//Boolean - Whether the line is curved between points
			bezierCurve : true,

			//Number - Tension of the bezier curve between points
			bezierCurveTension : 0.4,

			//Boolean - Whether to show a dot for each point
			pointDot : true,

			//Number - Radius of each point dot in pixels
			pointDotRadius : 4,

			//Number - Pixel width of point dot stroke
			pointDotStrokeWidth : 1,

			//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
			pointHitDetectionRadius : 20,

			//Boolean - Whether to show a stroke for datasets
			datasetStroke : true,

			//Number - Pixel width of dataset stroke
			datasetStrokeWidth : 2,

			//String - A legend template
			legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		};
		var desc = '';
		var yearClass = 'hidden';
		var avmonthClass = 'hidden';
		if(this.state.analytic === 'avmonthusage') {
			avmonthClass="row";
			desc = 'Monthly Average';
		} else if(this.state.analytic === 'avyearusage') {
			desc = 'Daily Average per year';
		} else if(this.state.analytic === 'avdayusage') {
			yearClass = 'row';
			desc = 'Daywise average per month for '+_year;
		} else if(this.state.analytic === 'peakweekdayUsage') {
			yearClass = 'row';
			desc = 'Peak day hours (7-10pm) average/mo for '+_year;
		}else if(this.state.analytic === 'peakeveusage') {
			yearClass = 'row';
			desc = 'Peak evening hours (5-8pm) average/mo for '+_year;
		} else {
			desc = 'Monthly Average'
		}

		var jan = {backgroundColor: 'rgba(220,220,220,1)'},
			feb = {backgroundColor: 'rgba(124,252,0,1)'},
			mar = {backgroundColor: 'rgba(0,255,255,1)'},
			apr = {backgroundColor: 'rgba(255,105,180,1)'},
			may = {backgroundColor: 'rgba(255,255,5,1)'},
			jun = {backgroundColor: 'rgba(255,75,75,1)'},
			jul = {backgroundColor: 'rgba(218,165,32,1)'},
			aug = {backgroundColor: 'rgba(10,75,195,1)'},
			sep = {backgroundColor: 'rgba(160,32,240,1)'},
			oct = {backgroundColor: 'rgba(40,15,75,1)'},
			nov = {backgroundColor: 'rgba(255,182,193,1)'},
			dec = {backgroundColor: 'rgba(0,100,5,1)'};

		var year1 = {backgroundColor: 'rgba(220,220,220,1)'},
			year2 = {backgroundColor: 'rgba(255,255,0,1)'},
			year3 = {backgroundColor: 'rgba(255,102,0,1)'},
			year4 = {backgroundColor: 'rgba(75,75,255,1)'},
			year5 = {backgroundColor: 'rgba(75,255,75,1)'},
			year6 = {backgroundColor: 'rgba(255,75,75,1)'};

		if(this.state.data.datasets.length > 0) {
			return (
				<div className="container-fluid">
					<div className="col-md-3">
						<div className="row">
							<div>Choose Train</div>
							<select className="col-md-8 select" size="25" onChange={this.stationChange}>{options1}</select>
						</div>
						<div className="row">
							<div>Choose Type</div>
							<select className="col-md-8 select" onChange={this.onTypeChange}>
								<option value="entries">Entries</option>
								<option value="exits">Exits</option>
							</select>
						</div>
						<div className="row">
							<div>Choose Analytic</div>
							<select className="col-md-8 select" onChange={this.onAnalyticChange}>
								<option value="avmonthusage">Monthly Average</option>
								<option value="avyearusage">Yearly Average</option>
								<option value="avdayusage">Day Wise Average</option>
								<option value="peakweekdayUsage">Day Peak Hours</option>
								<option value="peakeveusage">Evening Peak Hours</option>
							</select>
						</div>
						<div className={yearClass}>
							<div>Year</div>
							<select className="col-md-8 select" onChange={this.onYearChange}>
								<option value="2010">2010</option>
								<option value="2011">2011</option>
								<option value="2012">2012</option>
								<option value="2013">2013</option>
								<option value="2014">2014</option>
								<option value="2015">2015</option>
							</select>
						</div>
					</div>
					<div className="col-md-1">
						<ul className={avmonthClass}>
							<li>
								<div className="input-color">
									<div className="color-box" style={year1}></div>2010
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={year2}></div>2011
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={year3}></div>2012
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={year4}></div>2013
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={year5}></div>2014
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={year6}></div>2015
								</div>
							</li>
						</ul>
						<ul className={yearClass}>
							<li>
								<div className="input-color">
									<div className="color-box" style={jan}></div>Jan
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={feb}></div>Feb
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={mar}></div>Mar
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={apr}></div>Apr
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={may}></div>May
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={jun}></div>Jun
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={jul}></div>Jul
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={aug}></div>Aug
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={sep}></div>Sep
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={oct}></div>Oct
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={nov}></div>Nov
								</div>
							</li>
							<li>
								<div className="input-color">
									<div className="color-box" style={dec}></div>Dec
								</div>
							</li>
						</ul>
					</div>
					<div className="col-md-8">
						<div>
							<b>{desc}</b> - All values in millions
						</div>
						<div>
							<LineChart data={this.state.data} options={options} width="800" height="750" redraw/>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="container-fluid">
					<div className="col-md-4">
						<div className="row">
							<div>Choose Train</div>
							<select className="col-md-8 select" size="25" onChange={this.stationChange}>{options1}</select>
						</div>
					</div>
					<div className="col-md-8">
						Select a train for chart to display
					</div>
				</div>
			);
		}
	}
});

var options1 = [
	<option value="A">A</option>,
	<option value="B">B </option>,
	<option value="C">C</option>,
	<option value="D">D</option>,
	<option value="E">E</option>,
	<option value="F">F</option>,
	<option value="G">G</option>,
	<option value="J">J</option>,
	<option value="L">L</option>,
	<option value="M">M</option>,
	<option value="N">N</option>,
	<option value="Q">Q</option>,
	<option value="R">R</option>,
	<option value="S">S</option>,
	<option value="Z">Z</option>,
	<option value="1">1</option>,
	<option value="2">2</option>,
	<option value="3">3</option>,
	<option value="4">4</option>,
	<option value="5">5</option>,
	<option value="6">6</option>,
	<option value="7">7</option>
];


function _formatData(analytic, data, type, callback) {
	var _dataSets = [];

	switch(analytic) {
		case 'avmonthusage': _monthlyAv(_dataSets, data, type, callback);
			break;

		case 'avyearusage': _yearlyAv(_dataSets, data, type, callback);
			break;

		case 'avdayusage': _dailyAv(_dataSets, data, type, _year, callback);
			break;

		case 'peakweekdayusage': _dailyAv(_dataSets, data, type, _year, callback);
			break;

		case 'peakeveusage': _dailyAv(_dataSets, data, type, _year, callback);
			break;
	}
}

function _monthlyAv(_dataSets, data, type, callback) {
	for(var i=0; i<6;i++) {
		_dataSets.push({
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			data: [0,0,0,0,0,0,0,0,0,0,0,0]
		});
	}
	require('async').eachSeries(data, function(d, next) {
		switch(d.year) {
			case '2010':
				_dataSets[0].label = "2010";
				_dataSets[0].fillColor = "rgba(220,220,220,0.1)";
				_dataSets[0].strokeColor = "rgba(220,220,220,1)";
				_dataSets[0].pointColor = "rgba(220,220,220,1)";
				_dataSets[0].data[Number(d.month)-1] = Math.abs(d[type]/30000000);
				next();
				break;

			case '2011':
				_dataSets[1].label = "2011";
				_dataSets[1].fillColor =  "rgba(255,255,0,0.1)";
				_dataSets[1].strokeColor = "rgba(255,255,0,1)";
				_dataSets[1].pointColor = "rgba(255,255,0,1)";
				_dataSets[1].data[Number(d.month)-1] = Math.abs(d[type]/30000000);
				next();
				break;

			case '2012':
				_dataSets[2].label = "2012";
				_dataSets[2].fillColor =  "rgba(255,102,0,0.1)";
				_dataSets[2].strokeColor = "rgba(255,102,0,1)";
				_dataSets[2].pointColor = "rgba(255,102,0,1)";
				_dataSets[2].data[Number(d.month)-1] = Math.abs(d[type]/30000000);
				next();
				break;

			case '2013':
				_dataSets[3].label = "2013";
				_dataSets[3].fillColor =  "rgba(75,75,255,0.1)";
				_dataSets[3].strokeColor = "rgba(75,75,255,1)";
				_dataSets[3].pointColor = "rgba(75,75,255,1)";
				_dataSets[3].data[Number(d.month)-1] = Math.abs(d[type]/30000000);
				next();
				break;

			case '2014':
				_dataSets[4].label = "2014";
				_dataSets[4].fillColor =  "rgba(75,255,75,0.1)";
				_dataSets[4].strokeColor = "rgba(75,255,75,1)";
				_dataSets[4].pointColor = "rgba(75,255,75,1)";
				_dataSets[4].data[Number(d.month)-1] = Math.abs(d[type]/30000000);
				next();
				break;

			case '2015':
				_dataSets[5].label = "2015";
				_dataSets[5].fillColor =  "rgba(255,75,75,0.1)";
				_dataSets[5].strokeColor = "rgba(255,75,75,1)";
				_dataSets[5].pointColor = "rgba(255,75,75,1)";
				_dataSets[5].data[Number(d.month)-1] = Math.abs(d[type]/30000000);
				next();
				break;

			default: next();
		}
	}, function(error) {
		if(error) {
			callback(error);
		} else {
			_data = {
				labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
				datasets: _dataSets
			};
			callback(null, _data);
		}
	});
}

function _yearlyAv(_dataSets, data, type, callback) {
	for(var i=0; i<1;i++) {
		_dataSets.push({
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			data: [0,0,0,0,0,0]
		});
	}
	require('async').eachSeries(data, function(d, next) {
		_dataSets[0].label = "Yearly Average";
		_dataSets[0].fillColor = "rgba(220,120,210,0.1)";
		_dataSets[0].strokeColor = "rgba(220,120,210,1)";
		_dataSets[0].pointColor = "rgba(220,120,210,1)";
		switch(d.year) {
			case '2010':
				_dataSets[0].data[0] = Math.abs(d[type]/1000000);
				next();
				break;

			case '2011':
				_dataSets[0].data[1] = Math.abs(d[type]/1000000);
				next();
				break;

			case '2012':
				_dataSets[0].data[2] = Math.abs(d[type]/1000000);
				next();
				break;

			case '2013':
				_dataSets[0].data[3] = Math.abs(d[type]/1000000);
				next();
				break;

			case '2014':
				_dataSets[0].data[4] = Math.abs(d[type]/1000000);
				next();
				break;

			case '2015':
				_dataSets[0].data[5] = Math.abs(d[type]/1000000);
				next();
				break;

			default: next();
		}
	}, function(error) {
		if(error) {
			callback(error);
		} else {
			_data = {
				labels: ["2010", "2011", "2012", "2013", "2014", "2015"],
				datasets: _dataSets
			};
			callback(null, _data);
		}
	});
}

function _dailyAv(_dataSets, data, type, year, callback) {
	for(var i=0; i<12;i++) {
		_dataSets.push({
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			data: [0,0,0,0,0,0,0,0,0,0,0,0]
		});
	}

	require('async').eachSeries(data, function(d, next) {
		if(Number(year) === Number(d.year)) {
			try {
				switch (d.month) {
					case '1':
						_dataSets[0].label = "January";
						_dataSets[0].fillColor = "rgba(220, 220, 220,0)";
						_dataSets[0].strokeColor = "rgba(220,220,220,1)";
						_dataSets[0].pointColor = "rgba(220,220,220,1)";
						_dataSets[0].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '2':
						_dataSets[1].label = "February";
						_dataSets[1].fillColor = "rgba(124,252,0,0)";
						_dataSets[1].strokeColor = "rgba(124,252,0,1)";
						_dataSets[1].pointColor = "rgba(124,252,0,1)";
						_dataSets[1].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '3':
						_dataSets[2].label = "March";
						_dataSets[2].fillColor = "rgba(0,255,255,0)";
						_dataSets[2].strokeColor = "rgba(0,255,255,1)";
						_dataSets[2].pointColor = "rgba(0,255,255,1)";
						_dataSets[2].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '4':
						_dataSets[3].label = "April";
						_dataSets[3].fillColor = "rgba(255,105,180,0)";
						_dataSets[3].strokeColor = "rgba(255,105,180,1)";
						_dataSets[3].pointColor = "rgba(255,105,180,1)";
						_dataSets[3].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '5':
						_dataSets[4].label = "May";
						_dataSets[4].fillColor = "rgba(255,255,5,0)";
						_dataSets[4].strokeColor = "rgba(255,255,5,1)";
						_dataSets[4].pointColor = "rgba(255,255,5,1)";
						_dataSets[4].data[Number(d.day)] = Math.abs(d[type] / 30000000);
						_dataSets[4].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '6':
						_dataSets[5].label = "June";
						_dataSets[5].fillColor = "rgba(255,75,75,0)";
						_dataSets[5].strokeColor = "rgba(255,75,75,1)";
						_dataSets[5].pointColor = "rgba(255,75,75,1)";
						_dataSets[5].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '7':
						_dataSets[6].label = "July";
						_dataSets[6].fillColor = "rgba(218,165,32,0)";
						_dataSets[6].strokeColor = "rgba(218,165,32,1)";
						_dataSets[6].pointColor = "rgba(218,165,32,1)";
						_dataSets[6].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '8':
						_dataSets[7].label = "August";
						_dataSets[7].fillColor = "rgba(10,75,195,0)";
						_dataSets[7].strokeColor = "rgba(10,75,195,1)";
						_dataSets[7].pointColor = "rgba(10,75,195,1)";
						_dataSets[7].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '9':
						_dataSets[8].label = "September";
						_dataSets[8].fillColor = "rgba(160,32,240,0)";
						_dataSets[8].strokeColor = "rgba(160,32,240,1)";
						_dataSets[8].pointColor = "rgba(160,32,240,1)";
						_dataSets[8].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '10':
						_dataSets[9].label = "October";
						_dataSets[9].fillColor = "rgba(40,15,75,0)";
						_dataSets[9].strokeColor = "rgba(40,15,75,1)";
						_dataSets[9].pointColor = "rgba(40,15,75,1)";
						_dataSets[9].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '11':
						_dataSets[10].label = "November";
						_dataSets[10].fillColor = "rgba(255,182,193,0)";
						_dataSets[10].strokeColor = "rgba(255,182,193,1)";
						_dataSets[10].pointColor = "rgba(255,182,193,1)";
						_dataSets[10].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					case '12':
						_dataSets[11].label = "December";
						_dataSets[11].fillColor = "rgba(0,100,5,0)";
						_dataSets[11].strokeColor = "rgba(0,100,5,1)";
						_dataSets[11].pointColor = "rgba(0,100,5,1)";
						_dataSets[11].data[Number(d.day)] += Math.abs(d[type] / 4000000);
						next();
						break;

					default:
						next();
				}
			}catch(er) {
				console.log(er)
			}
		} else {
			next();
		}
	}, function(error) {
		if(error) {
			callback(error);
		} else {
			_data = {
				labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
				datasets: _dataSets
			};
			callback(null, _data);
		}
	});
}

module.exports = LC;