var LineChart = require("react-chartjs").Line;
var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');
var storeMap = require('../stores/store-map');
var actionMap = require('../actions/action-map');
var storeAn = require('../stores/store-an');
var actionAn = require('../actions/action-an');
var serviceAnalytics = require('../services/svc-analytics');

var _station;
var _response;
var _analyticType = 'avmonth';
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
			analytic: 'avmonth',
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
		if(this.state.analytic === 'avmonth') {
			avmonthClass="row";
			desc = 'Monthly Average';
		} else if(this.state.analytic === 'avyear') {
			desc = 'Daily Average per year';
		} else if(this.state.analytic === 'avday') {
			yearClass = 'row';
			desc = 'Daywise average per month for '+_year;
		} else if(this.state.analytic === 'peakweekday') {
			yearClass = 'row';
			desc = 'Peak day hours (7-10am) average/mo for '+_year;
		}else if(this.state.analytic === 'peakeve') {
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
							<div>Choose Train Station</div>
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
								<option value="avmonth">Monthly Average</option>
								<option value="avyear">Yearly Average</option>
								<option value="avday">Day Wise Average</option>
								<option value="peakweekday">Day Peak Hours</option>
								<option value="peakeve">Evening Peak Hours</option>
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
							<div>Choose Train Station</div>
							<select className="col-md-8 select" size="25" onChange={this.stationChange}>{options1}</select>
						</div>
					</div>
					<div className="col-md-8">
						Select a station for chart to display
					</div>
				</div>
			);
		}
	}
});

var options1 = [
	<option value="R001">SOUTH FERRY </option>,
	<option value="R002">FULTON ST </option>,
	<option value="R003">CYPRESS HILLS </option>,
	<option value="R004">ELDERTS LANE </option>,
	<option value="R005">FOREST PARKWAY </option>,
	<option value="R006">WOODHAVEN BLVD </option>,
	<option value="R007">104 ST </option>,
	<option value="R008">111 ST </option>,
	<option value="R009">121 ST </option>,
	<option value="R010">42 ST-PA BUS TE </option>,
	<option value="R011">42 ST-PA BUS TE </option>,
	<option value="R012">34 ST-PENN STA </option>,
	<option value="R013">34 ST-PENN STA </option>,
	<option value="R014">FULTON ST </option>,
	<option value="R015">5 AVE-53 ST </option>,
	<option value="R016">LEXINGTON-53 ST </option>,
	<option value="R017">LEXINGTON-53 ST </option>,
	<option value="R018">74 ST-BROADWAY </option>,
	<option value="R019">JAMAICA-179 ST </option>,
	<option value="R020">47-50 ST-ROCK </option>,
	<option value="R021">42 ST-BRYANT PK </option>,
	<option value="R022">34 ST-HERALD SQ </option>,
	<option value="R023">34 ST-HERALD SQ </option>,
	<option value="R024">SUTPHIN BLVD </option>,
	<option value="R025">JAMAICA CENTER </option>,
	<option value="R027">WALL ST </option>,
	<option value="R028">FULTON ST </option>,
	<option value="R029">CHAMBERS ST </option>,
	<option value="R030">CHAMBERS ST </option>,
	<option value="R031">34 ST-PENN STA </option>,
	<option value="R032">42 ST-TIMES SQ </option>,
	<option value="R033">42 ST-TIMES SQ </option>,
	<option value="R034">125 ST </option>,
	<option value="R035">168 ST-BROADWAY </option>,
	<option value="R036">DYCKMAN ST </option>,
	<option value="R037">207 ST </option>,
	<option value="R038">215 ST </option>,
	<option value="R039">MARBLE HILL-225 </option>,
	<option value="R040">231 ST </option>,
	<option value="R041">BOWLING GREEN </option>,
	<option value="R042">BOWLING GREEN </option>,
	<option value="R043">WALL ST </option>,
	<option value="R044">BROOKLYN BRIDGE </option>,
	<option value="R045">42 ST-GRD CNTRL </option>,
	<option value="R046">42 ST-GRD CNTRL </option>,
	<option value="R047">42 ST-GRD CNTRL </option>,
	<option value="R048">42 ST-GRD CNTRL </option>,
	<option value="R049">51 ST </option>,
	<option value="R050">LEXINGTON AVE </option>,
	<option value="R051">LEXINGTON AVE </option>,
	<option value="R052">WOODLAWN ROAD </option>,
	<option value="R053">149 ST-3 AVE </option>,
	<option value="R054">5 AVE-BRYANT PK </option>,
	<option value="R055">MAIN ST </option>,
	<option value="R056">NEVINS ST </option>,
	<option value="R057">PACIFIC ST </option>,
	<option value="R058">BERGEN ST </option>,
	<option value="R059">GRAND ARMY PLAZ </option>,
	<option value="R060">EASTERN PKWY </option>,
	<option value="R061">NOSTRAND AVE </option>,
	<option value="R062">CROWN HTS-UTICA </option>,
	<option value="R063">SUTTER AVE </option>,
	<option value="R064">SARATOGA AVE </option>,
	<option value="R065">ROCKAWAY AVE </option>,
	<option value="R066">JUNIUS ST </option>,
	<option value="R067">PENNSYLVANIA AV </option>,
	<option value="R068">VAN SICLEN AVE </option>,
	<option value="R069">NEW LOTS AVE </option>,
	<option value="R070">ST. GEORGE </option>,
	<option value="R076">2 BDWY CUST SRV </option>,
	<option value="R079">5 AVE-59 ST </option>,
	<option value="R080">57 ST-7 AVE </option>,
	<option value="R081">49 ST-7 AVE </option>,
	<option value="R082">28 ST-BROADWAY </option>,
	<option value="R083">23 ST-5 AVE </option>,
	<option value="R084">59 ST-COLUMBUS </option>,
	<option value="R085">8 ST-B'WAY NYU </option>,
	<option value="R086">PRINCE ST-B'WAY </option>,
	<option value="R087">MURRAY ST-B'WAY </option>,
	<option value="R088">CORTLANDT ST </option>,
	<option value="R089">JAY ST-METROTEC </option>,
	<option value="R090">BEEBE-39 AVE </option>,
	<option value="R091">WASHINGTON-36 A </option>,
	<option value="R092">BROADWAY-31 ST </option>,
	<option value="R093">GRAND-30 AVE </option>,
	<option value="R094">HOYT ST-ASTORIA </option>,
	<option value="R095">DITMARS BL-31 S </option>,
	<option value="R096">82 ST-JACKSON H </option>,
	<option value="R097">JUNCTION BLVD </option>,
	<option value="R098">CHURCH AVE </option>,
	<option value="R099">DEKALB AVE </option>,
	<option value="R100">METROPOLITAN AV </option>,
	<option value="R101">145 ST </option>,
	<option value="R102">125 ST </option>,
	<option value="R103">BROADWAY-ENY </option>,
	<option value="R104">167 ST </option>,
	<option value="R105">14 ST </option>,
	<option value="R106">CASTLE HILL AVE </option>,
	<option value="R107">WESTCHESTER SQ </option>,
	<option value="R108">BOROUGH HALL/CT </option>,
	<option value="R109">CHURCH AVE </option>,
	<option value="R110">FLATBUSH AVE </option>,
	<option value="R111">23 ST </option>,
	<option value="R112">FORDHAM ROAD </option>,
	<option value="R113">7 AVE-53 ST </option>,
	<option value="R114">PARSONS BLVD </option>,
	<option value="R115">169 ST </option>,
	<option value="R116">50 ST </option>,
	<option value="R117">242 ST </option>,
	<option value="R118">CANAL ST </option>,
	<option value="R119">FORDHAM ROAD </option>,
	<option value="R120">MORRISON AVE </option>,
	<option value="R121">QUEENSBORO PLZ </option>,
	<option value="R122">90 ST-ELMHURST </option>,
	<option value="R123">FRANKLIN AVE </option>,
	<option value="R124">KINGSTON AVE </option>,
	<option value="R125">BROAD ST </option>,
	<option value="R126">175 ST </option>,
	<option value="R127">JAY ST-METROTEC </option>,
	<option value="R128">SUTPHIN BLVD </option>,
	<option value="R129">BERGEN ST </option>,
	<option value="R130">KINGS HIGHWAY </option>,
	<option value="R131">23 ST </option>,
	<option value="R132">125 ST </option>,
	<option value="R133">MOSHOLU PARKWAY </option>,
	<option value="R134">HUNTERS PT AVE </option>,
	<option value="R135">NEWKIRK AVE </option>,
	<option value="R136">SHEEPSHEAD BAY </option>,
	<option value="R137">MYRTLE AVE </option>,
	<option value="R138">W 4 ST-WASH SQ </option>,
	<option value="R139">CANAL ST </option>,
	<option value="R140">QUEENS PLAZA </option>,
	<option value="R141">FOREST HILLS-71 </option>,
	<option value="R142">DELANCEY ST </option>,
	<option value="R143">28 ST </option>,
	<option value="R144">96 ST </option>,
	<option value="R145">WAKEFIELD-241 </option>,
	<option value="R146">HUNTS POINT AVE </option>,
	<option value="R147">61 ST/WOODSIDE </option>,
	<option value="R148">PARKSIDE AVE </option>,
	<option value="R149">NEWKIRK AVE </option>,
	<option value="R150">AVE U </option>,
	<option value="R151">STILLWELL AVE </option>,
	<option value="R152">ROCKAWAY PKY </option>,
	<option value="R153">UTICA AVE </option>,
	<option value="R154">TREMONT AVE </option>,
	<option value="R155">KINGSBRIDGE RD </option>,
	<option value="R156">BEDFORD PARK BL </option>,
	<option value="R157">NORWOOD-205 ST </option>,
	<option value="R158">UNION TPK-KEW G </option>,
	<option value="R159">116 ST-COLUMBIA </option>,
	<option value="R160">ASTOR PLACE </option>,
	<option value="R161">KINGSBRIDGE RD </option>,
	<option value="R162">ELDER AVE </option>,
	<option value="R163">14 ST-6 AVE </option>,
	<option value="R164">66 ST-LINCOLN </option>,
	<option value="R165">TOMPKINSVILLE </option>,
	<option value="R166">79 ST </option>,
	<option value="R167">86 ST </option>,
	<option value="R168">96 ST </option>,
	<option value="R169">137 ST-CITY COL </option>,
	<option value="R170">14 ST-UNION SQ </option>,
	<option value="R171">7 AVE </option>,
	<option value="R172">BRIGHTON BEACH </option>,
	<option value="R173">INWOOD-207 ST </option>,
	<option value="R174">181 ST </option>,
	<option value="R175">14 ST </option>,
	<option value="R176">33 ST </option>,
	<option value="R177">68ST-HUNTER COL </option>,
	<option value="R178">77 ST </option>,
	<option value="R179">86 ST </option>,
	<option value="R180">103 ST </option>,
	<option value="R181">110 ST </option>,
	<option value="R182">116 ST </option>,
	<option value="R183">BEDFORD PARK BL </option>,
	<option value="R184">CORTELYOU ROAD </option>,
	<option value="R185">DYCKMAN-200 ST </option>,
	<option value="R186">86 ST </option>,
	<option value="R187">81 ST-MUSEUM </option>,
	<option value="R188">50 ST </option>,
	<option value="R189">CHRISTOPHER ST </option>,
	<option value="R190">23 ST </option>,
	<option value="R191">103 ST </option>,
	<option value="R192">110 ST-CATHEDRL </option>,
	<option value="R193">157 ST </option>,
	<option value="R194">BLEECKER ST </option>,
	<option value="R195">161 ST-YANKEE </option>,
	<option value="R196">PROSPECT PARK </option>,
	<option value="R197">36 ST </option>,
	<option value="R198">NOSTRAND AVE </option>,
	<option value="R199">KINGSTON-THROOP </option>,
	<option value="R200">EUCLID AVE </option>,
	<option value="R201">WOODHAVEN BLVD </option>,
	<option value="R202">63 DR-REGO PARK </option>,
	<option value="R203">23 ST-6 AVE </option>,
	<option value="R204">CHURCH AVE </option>,
	<option value="R205">149 ST-GR CONC </option>,
	<option value="R206">125 ST </option>,
	<option value="R207">135 ST </option>,
	<option value="R208">103 ST-CORONA </option>,
	<option value="R209">STERLING ST </option>,
	<option value="R210">BEVERLY ROAD </option>,
	<option value="R211">KINGS HIGHWAY </option>,
	<option value="R212">59 ST </option>,
	<option value="R213">BAY RIDGE AVE </option>,
	<option value="R214">77 ST </option>,
	<option value="R215">86 ST </option>,
	<option value="R216">BAY RIDGE-95 ST </option>,
	<option value="R217">HOYT/SCHERMER </option>,
	<option value="R218">ELMHURST AVE </option>,
	<option value="R219">67 AVE </option>,
	<option value="R220">CARROLL ST </option>,
	<option value="R221">167 ST </option>,
	<option value="R222">E 177 ST-PARKCH </option>,
	<option value="R223">46 ST-BLISS ST </option>,
	<option value="R224">CLARK ST </option>,
	<option value="R225">HOYT ST </option>,
	<option value="R226">GUN HILL ROAD </option>,
	<option value="R227">RECTOR ST </option>,
	<option value="R228">AVE J </option>,
	<option value="R229">AVE M </option>,
	<option value="R230">NECK ROAD </option>,
	<option value="R231">UNION ST </option>,
	<option value="R232">45 ST </option>,
	<option value="R233">53 ST </option>,
	<option value="R234">50 ST </option>,
	<option value="R235">BEDFORD AVE </option>,
	<option value="R236">DEKALB AVE </option>,
	<option value="R237">182-183 ST </option>,
	<option value="R238">STEINWAY ST </option>,
	<option value="R239">GREENPOINT AVE </option>,
	<option value="R240">GRAND ST </option>,
	<option value="R241">15 ST-PROSPECT </option>,
	<option value="R242">18 AVE </option>,
	<option value="R243">170 ST </option>,
	<option value="R244">BURNSIDE AVE </option>,
	<option value="R245">ST LAWRENCE AVE </option>,
	<option value="R246">PROSPECT AVE </option>,
	<option value="R247">55 ST </option>,
	<option value="R248">1 AVE </option>,
	<option value="R249">GRAHAM AVE </option>,
	<option value="R250">GRAND ST </option>,
	<option value="R251">96 ST </option>,
	<option value="R252">HIGH ST </option>,
	<option value="R253">174-175 ST </option>,
	<option value="R254">GRAND AV-NEWTON </option>,
	<option value="R255">VAN WYCK BLVD </option>,
	<option value="R256">NASSAU AV </option>,
	<option value="R257">EAST BROADWAY </option>,
	<option value="R258">9 ST </option>,
	<option value="R259">ROOSEVELT IS </option>,
	<option value="R260">181 ST </option>,
	<option value="R261">40 ST-LOWERY ST </option>,
	<option value="R262">BEVERLEY ROAD </option>,
	<option value="R263">AVE H </option>,
	<option value="R264">OCEAN PARKWAY </option>,
	<option value="R265">MONTROSE AVE </option>,
	<option value="R266">HALSEY ST </option>,
	<option value="R267">46 ST </option>,
	<option value="R268">LORIMER ST </option>,
	<option value="R269">BEDFORD/NOSTRAN </option>,
	<option value="R270">SMITH-9 ST </option>,
	<option value="R271">AVE X </option>,
	<option value="R272">28 ST </option>,
	<option value="R273">145 ST </option>,
	<option value="R274">191 ST </option>,
	<option value="R275">183 ST </option>,
	<option value="R276">VERNON/JACKSON </option>,
	<option value="R277">PRESIDENT ST </option>,
	<option value="R278">25 ST </option>,
	<option value="R279">JEFFERSON ST </option>,
	<option value="R280">190 ST </option>,
	<option value="R281">72 ST </option>,
	<option value="R282">SPRING ST </option>,
	<option value="R283">LAFAYETTE AVE </option>,
	<option value="R284">CLINTON-WASH AV </option>,
	<option value="R285">FAR ROCKAWAY </option>,
	<option value="R286">MYRTLE-WILLOUGH </option>,
	<option value="R287">CLASSON AVE </option>,
	<option value="R288">7 AV-PARK SLOPE </option>,
	<option value="R289">FT HAMILTON PKY </option>,
	<option value="R290">HOUSTON ST </option>,
	<option value="R291">33 ST/RAWSON ST </option>,
	<option value="R292">BAYCHESTER AVE </option>,
	<option value="R293">34 ST-PENN STA </option>,
	<option value="R294">MORGAN AVE </option>,
	<option value="R295">WILSON AVE </option>,
	<option value="R296">163 ST-AMSTERDM </option>,
	<option value="R297">FRANKLIN AVE </option>,
	<option value="R298">NORTHERN BLVD </option>,
	<option value="R299">BROADWAY </option>,
	<option value="R300">2 AVE </option>,
	<option value="R301">YORK ST </option>,
	<option value="R302">57 ST </option>,
	<option value="R303">21 ST </option>,
	<option value="R304">RECTOR ST </option>,
	<option value="R305">CORTLANDT ST </option>,
	<option value="R306">238 ST </option>,
	<option value="R307">138 ST-GR CONC </option>,
	<option value="R308">MT EDEN AVE </option>,
	<option value="R309">176 ST </option>,
	<option value="R310">111 ST </option>,
	<option value="R311">BOWERY </option>,
	<option value="R312">W 8 ST-AQUARIUM </option>,
	<option value="R313">BUSHWICK AVE </option>,
	<option value="R314">103 ST </option>,
	<option value="R315">155 ST </option>,
	<option value="R316">FLUSHING AVE </option>,
	<option value="R317">CLINTON-WASH AV </option>,
	<option value="R318">FULTON ST </option>,
	<option value="R319">LEXINGTON AVE </option>,
	<option value="R320">CANAL ST </option>,
	<option value="R321">18 ST </option>,
	<option value="R322">SPRING ST </option>,
	<option value="R323">110 ST-CPN </option>,
	<option value="R324">116 ST </option>,
	<option value="R325">WHITLOCK AVE </option>,
	<option value="R326">ZEREGA AVE </option>,
	<option value="R327">52 ST-LINCOLN </option>,
	<option value="R328">METS-WILLETS PT </option>,
	<option value="R329">MORRIS PARK </option>,
	<option value="R330">3 AVE </option>,
	<option value="R331">155 ST </option>,
	<option value="R332">135 ST </option>,
	<option value="R333">116 ST </option>,
	<option value="R334">CATHEDRL-110 ST </option>,
	<option value="R335">BEACH 67 ST </option>,
	<option value="R336">BEACH 60 ST </option>,
	<option value="R337">BEACH 44 ST </option>,
	<option value="R338">BEACH 36 ST </option>,
	<option value="R339">36 ST </option>,
	<option value="R340">65 ST </option>,
	<option value="R341">75 AVE </option>,
	<option value="R342">JAMAICA-VAN WYC </option>,
	<option value="R343">FRANKLIN ST </option>,
	<option value="R344">145 ST </option>,
	<option value="R345">148 ST-LENOX </option>,
	<option value="R346">COURT SQ </option>,
	<option value="R347">69 ST-FISK AVE </option>,
	<option value="R348">ATLANTIC AVE </option>,
	<option value="R349">SUTTER AVE </option>,
	<option value="R350">LIVONIA AVE </option>,
	<option value="R352">HEWES ST </option>,
	<option value="R353">LORIMER ST </option>,
	<option value="R354">OXFORD-104 ST </option>,
	<option value="R355">GREENWOOD-111 </option>,
	<option value="R356">LEFFERTS BLVD </option>,
	<option value="R357">AQUEDUCT-N CNDT </option>,
	<option value="R358">BEACH 25 ST </option>,
	<option value="R359">COURT SQ </option>,
	<option value="R360">VAN ALSTON-21ST </option>,
	<option value="R361">PELHAM PARKWAY </option>,
	<option value="R362">ALLERTON AVE </option>,
	<option value="R363">BURKE AVE </option>,
	<option value="R364">GUN HILL ROAD </option>,
	<option value="R365">219 ST </option>,
	<option value="R366">225 ST </option>,
	<option value="R367">233 ST </option>,
	<option value="R368">9 AVE </option>,
	<option value="R369">FT HAMILTON PKY </option>,
	<option value="R370">71 ST </option>,
	<option value="R371">79 ST </option>,
	<option value="R372">18 AVE </option>,
	<option value="R373">20 AVE </option>,
	<option value="R374">BAY PARKWAY </option>,
	<option value="R375">NEW LOTS AVE </option>,
	<option value="R376">EAST 105 ST </option>,
	<option value="R377">FLUSHING AVE </option>,
	<option value="R378">MYRTLE AVE </option>,
	<option value="R379">KOSCIUSZKO ST </option>,
	<option value="R380">GATES AVE </option>,
	<option value="R381">HALSEY ST </option>,
	<option value="R382">GRANT AVE </option>,
	<option value="R383">HUDSON-80 ST </option>,
	<option value="R384">BOYD-88 ST </option>,
	<option value="R385">ROCKAWAY BLVD </option>,
	<option value="R386">174 ST </option>,
	<option value="R387">E TREMONT AVE </option>,
	<option value="R388">E 180 ST </option>,
	<option value="R389">BRONX PARK EAST </option>,
	<option value="R390">8 AVE </option>,
	<option value="R391">FT HAMILTON PKY </option>,
	<option value="R392">18 AVE </option>,
	<option value="R393">20 AVE </option>,
	<option value="R394">BAY PKY-22 AVE </option>,
	<option value="R395">KINGS HIGHWAY </option>,
	<option value="R396">AVE U </option>,
	<option value="R397">86 ST </option>,
	<option value="R398">NEW UTRECHT AVE </option>,
	<option value="R399">25 AVE </option>,
	<option value="R400">BAY 50 ST </option>,
	<option value="R401">CENTRAL AVE </option>,
	<option value="R402">SENECA AVE </option>,
	<option value="R403">FOREST AVE </option>,
	<option value="R404">FRESH POND ROAD </option>,
	<option value="R405">JACKSON AVE </option>,
	<option value="R406">PROSPECT AVE </option>,
	<option value="R407">INTERVALE-163 </option>,
	<option value="R408">SIMPSON ST </option>,
	<option value="R409">FREEMAN ST </option>,
	<option value="R410">NYC &amp; CO - 7 AV </option>,
	<option value="R411">PARK PLACE </option>,
	<option value="R412">BOTANIC GARDEN </option>,
	<option value="R413">KNICKERBOCKER </option>,
	<option value="R414">HOWARD BCH-JFK </option>,
	<option value="R415">BROAD CHANNEL </option>,
	<option value="R416">BEACH 90 ST </option>,
	<option value="R417">BEACH 98 ST </option>,
	<option value="R418">BEACH 105 ST </option>,
	<option value="R419">ROCKAWAY PK 116 </option>,
	<option value="R420">DITMAS AVE </option>,
	<option value="R421">AVE I </option>,
	<option value="R422">22 AVE-BAY PKY </option>,
	<option value="R423">AVE N </option>,
	<option value="R424">AVE P </option>,
	<option value="R425">AVE U </option>,
	<option value="R426">NEPTUNE AVE </option>,
	<option value="R427">MIDDLETOWN ROAD </option>,
	<option value="R428">BUHRE AVE </option>,
	<option value="R429">PELHAM BAY PARK </option>,
	<option value="R430">PELHAM PARKWAY </option>,
	<option value="R431">DYRE AVE </option>,
	<option value="R432">CHAUNCEY ST </option>,
	<option value="R433">ALABAMA AVE </option>,
	<option value="R434">VAN SICLEN AVE </option>,
	<option value="R435">CLEVELAND ST </option>,
	<option value="R436">NORWOOD AVE </option>,
	<option value="R437">CRESCENT ST </option>,
	<option value="R438">RALPH AVE </option>,
	<option value="R439">ROCKAWAY AVE </option>,
	<option value="R440">LIBERTY AVE </option>,
	<option value="R441">VAN SICLEN AVE </option>,
	<option value="R442">SHEPHERD AVE </option>,
	<option value="R443">170 ST </option>,
	<option value="R444">NEREID AVE </option>,
	<option value="R445">138 ST-3 AVE </option>,
	<option value="R446">BROOK AVE </option>,
	<option value="R447">CYPRESS AVE </option>,
	<option value="R448">E 143 ST </option>,
	<option value="R449">E 149 ST </option>,
	<option value="R450">LONGWOOD AVE </option>,
	<option value="R451">WINTHROP ST </option>,
	<option value="R452">72 ST </option>,
	<option value="R453">23 ST-6 AVE </option>,
	<option value="R454">PROSPECT AVE </option>,
	<option value="R455">25 ST </option>,
	<option value="R456">HOYT ST </option>,
	<option value="R457">METROCARD BUS 1 </option>,
	<option value="R458">METROCARD BUS 2 </option>,
	<option value="R459">ORCHARD BEACH </option>,
	<option value="R460">MARCY AVE </option>,
	<option value="R461">BROADWAY/LAFAY </option>,
	<option value="R462">CANAL ST </option>,
	<option value="R463">CANAL ST </option>,
	<option value="R464">AQUEDUCT TRACK </option>,
	<option value="R465">METROCARD VAN-1 </option>,
	<option value="R466">METROCARD VAN-2 </option>,
	<option value="R467">METROCARD VAN-3 </option>,
	<option value="R468">RIT-MANHATTAN </option>,
	<option value="R469">RIT-ROOSEVELT </option>,
	<option value="R470">ELTINGVILLE PK </option>,
	<option value="R526">LIB-HEMPSTEAD </option>,
	<option value="R532">WEST COUNTY CTR </option>,
	<option value="R535">JFK HOWARD BCH </option>,
	<option value="R536">JFK JAMAICA CT1 </option>,
	<option value="R537">JFK JAMAICA CT2 </option>,
	<option value="R538">LGA AIRPORT CTB </option>,
	<option value="R540">PATH WTC 2 </option>,
	<option value="R541">THIRTY THIRD ST </option>,
	<option value="R542">TWENTY THIRD ST </option>,
	<option value="R543">EXCHANGE PLACE </option>,
	<option value="R544">HARRISON </option>,
	<option value="R545">14TH STREET </option>,
	<option value="R546">PAVONIA/NEWPORT </option>,
	<option value="R547">9TH STREET </option>,
	<option value="R548">CHRISTOPHER ST </option>,
	<option value="R549">NEWARK HM HE </option>,
	<option value="R550">LACKAWANNA </option>,
	<option value="R551">GROVE STREET </option>,
	<option value="R552">JOURNAL SQUARE </option>
];


function _formatData(analytic, data, type, callback) {
	var _dataSets = [];

	switch(analytic) {
		case 'avmonth': _monthlyAv(_dataSets, data, type, callback);
			break;

		case 'avyear': _yearlyAv(_dataSets, data, type, callback);
			break;

		case 'avday': _dailyAv(_dataSets, data, type, _year, callback);
			break;

		case 'peakweekday': _dailyAv(_dataSets, data, type, _year, callback);
			break;

		case 'peakeve': _dailyAv(_dataSets, data, type, _year, callback);
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