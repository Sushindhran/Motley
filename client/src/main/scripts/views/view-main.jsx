var React = require('react');
var Router = require('react-router');
var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var DateTimePicker = require("react-datetimepicker");
var actionMap = require('../actions/action-map');
var HeatMap = require('../components/heatmap.jsx');
var serviceTurnstile = require('../services/svc-turnstile');

var _date = 0,
	_repsonse = [],
	_type = 'entries',
	_station;

var Main = React.createClass({
	mixins: [
		Router.Navigation
	],

	getInitialState: function () {
		return {
			data: [],
			displayData: {
				exits: 0,
				entries: 0
			}
		}
	},

	getTurnstileData: function() {
		var date, time;
		var momentObj = moment(Number(_date)).format("MM-DD-YYYY HH:MM:SS");

		var dateSplit = momentObj.toString().split(' ');
		date = dateSplit[0];
		time = dateSplit[1];

		serviceTurnstile.getCaptionResponse(date, time).then(
			function(response) {
				_repsonse = response;
				if(_type === 'entries') {
					_formatResponseForEntries(response, function (ans) {
						actionMap.newData({
							max: 10000000,
							data: ans
						});
					}.bind(this));
				} else {
					_formatResponseForExits(response, function (ans) {
						actionMap.newData({
							max: 10000000,
							data: ans
						});
					}.bind(this));
				}
			}.bind(this),
			function(error) {

			}
		)
	},

	typeChange: function(x) {
		_type = x.target.value;
	},

	dateChange: function(x) {
		_date = x;
	},

	stationChange: function(x) {
		var remote = x.target.value;
		_station = remote;
		var data = _getDataForStation(remote);
		this.setState({
			displayData: {
				entries: data.entries,
				exits: data.exits
			}
		});
	},

	changePage: function() {
		actionMap.saveStation(_station);
		this.transitionTo('charts');
	},

	render: function() {
		var options = [
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

		return (
			<div className="container-fluid">
				<div className="col-md-3">
					<div className="row">
						<span className="col-md-6">
							<DateTimePicker
								time="true"
								inputMode="true"
								dateFormat="MM-DD-YYYY"
								dateTimeFormat="MM-DD-YYYY HH:MM:SS"
								onChange={this.dateChange}
							/>
						</span>
						<select className="col-md-2 select" ref="type" onChange={this.typeChange}>
							<option value="entries">entries</option>
							<option value="exits">exits</option>
						</select>
						<span className="col-md-2">
							<button className="btn btn-primary" onClick={this.getTurnstileData}>   GO    </button>
						</span>
					</div>
					<div className="row">
						<span className="col-md-3">Select Station</span>
						<select className="col-md-4 select" ref="station" size="10" onChange={this.stationChange}>
							{
								options
							}
						</select>
					</div>
					<div className="row">
						<span className="col-md-5">Entries:  {this.state.displayData.entries}</span>
						<span className="col-md-5">Exits:    {this.state.displayData.exits}</span>
					</div>
					<div className="row">
						<button className="btn btn-primary" onClick={this.changePage}> View Charts </button>
					</div>
					<br/>
				</div>
				<div className="map col-md-9">
					<HeatMap data={this.state.data}/>
				</div>
			</div>
		);
	}
});

//[{lat: 24.6408, lng:46.7728, count: 3},{lat: 50.75, lng:-1.55, count: 1},{lat: 52.6333, lng:1.75, count: 1},{lat: 48.15, lng:9.4667, count: 1},{lat: 52.35, lng:4.9167, count: 2},{lat: 60.8, lng:11.1, count: 1},{lat: 43.561, lng:-116.214, count: 1},{lat: 47.5036, lng:-94.685, count: 1},{lat: 42.1818, lng:-71.1962, count: 1},{lat: 42.0477, lng:-74.1227, count: 1},{lat: 40.0326, lng:-75.719, count: 1},{lat: 40.7128, lng:-73.2962, count: 2},{lat: 27.9003, lng:-82.3024, count: 1},{lat: 38.2085, lng:-85.6918, count: 1},{lat: 46.8159, lng:-100.706, count: 1},{lat: 30.5449, lng:-90.8083, count: 1},{lat: 44.735, lng:-89.61, count: 1},{lat: 41.4201, lng:-75.6485, count: 2},{lat: 39.4209, lng:-74.4977, count: 1},{lat: 39.7437, lng:-104.979, count: 1},{lat: 39.5593, lng:-105.006, count: 1},{lat: 45.2673, lng:-93.0196, count: 1},{lat: 41.1215, lng:-89.4635, count: 1},{lat: 43.4314, lng:-83.9784, count: 1},{lat: 43.7279, lng:-86.284, count: 1},{lat: 40.7168, lng:-73.9861, count: 1},{lat: 47.7294, lng:-116.757, count: 1},{lat: 47.7294, lng:-116.757, count: 2},{lat: 35.5498, lng:-118.917, count: 1},{lat: 34.1568, lng:-118.523, count: 1},{lat: 39.501, lng:-87.3919, count: 3},{lat: 33.5586, lng:-112.095, count: 1},{lat: 38.757, lng:-77.1487, count: 1},{lat: 33.223, lng:-117.107, count: 1},{lat: 30.2316, lng:-85.502, count: 1},{lat: 39.1703, lng:-75.5456, count: 8},{lat: 30.0041, lng:-95.2984, count: 2},{lat: 29.7755, lng:-95.4152, count: 1},{lat: 41.8014, lng:-87.6005, count: 1},{lat: 37.8754, lng:-121.687, count: 7},{lat: 38.4493, lng:-122.709, count: 1},{lat: 40.5494, lng:-89.6252, count: 1},{lat: 42.6105, lng:-71.2306, count: 1},{lat: 40.0973, lng:-85.671, count: 1},{lat: 40.3987, lng:-86.8642, count: 1},{lat: 40.4224, lng:-86.8031, count: 4},{lat: 47.2166, lng:-122.451, count: 1},{lat: 32.2369, lng:-110.956, count: 1},{lat: 41.3969, lng:-87.3274, count: 2},{lat: 41.7364, lng:-89.7043, count: 2},{lat: 42.3425, lng:-71.0677, count: 1},{lat: 33.8042, lng:-83.8893, count: 1},{lat: 36.6859, lng:-121.629, count: 2},{lat: 41.0957, lng:-80.5052, count: 1},{lat: 46.8841, lng:-123.995, count: 1},{lat: 40.2851, lng:-75.9523, count: 2},{lat: 42.4235, lng:-85.3992, count: 1},{lat: 39.7437, lng:-104.979, count: 2},{lat: 25.6586, lng:-80.3568, count: 7},{lat: 33.0975, lng:-80.1753, count: 1},{lat: 25.7615, lng:-80.2939, count: 1},{lat: 26.3739, lng:-80.1468, count: 1},{lat: 37.6454, lng:-84.8171, count: 1},{lat: 34.2321, lng:-77.8835, count: 1},{lat: 34.6774, lng:-82.928, count: 1},{lat: 39.9744, lng:-86.0779, count: 1},{lat: 35.6784, lng:-97.4944, count: 2},{lat: 33.5547, lng:-84.1872, count: 1},{lat: 27.2498, lng:-80.3797, count: 1},{lat: 41.4789, lng:-81.6473, count: 1},{lat: 41.813, lng:-87.7134, count: 1},{lat: 41.8917, lng:-87.9359, count: 1},{lat: 35.0911, lng:-89.651, count: 1},{lat: 32.6102, lng:-117.03, count: 1},{lat: 41.758, lng:-72.7444, count: 1},{lat: 39.8062, lng:-86.1407, count: 1},{lat: 41.872, lng:-88.1662, count: 1},{lat: 34.1404, lng:-81.3369, count: 1},{lat: 46.15, lng:-60.1667, count: 1},{lat: 36.0679, lng:-86.7194, count: 1},{lat: 43.45, lng:-80.5, count: 1},{lat: 44.3833, lng:-79.7, count: 1},{lat: 45.4167, lng:-75.7, count: 2},{lat: 43.75, lng:-79.2, count: 2},{lat: 45.2667, lng:-66.0667, count: 3},{lat: 42.9833, lng:-81.25, count: 2},{lat: 44.25, lng:-79.4667, count: 3},{lat: 45.2667, lng:-66.0667, count: 2},{lat: 34.3667, lng:-118.478, count: 3},{lat: 42.734, lng:-87.8211, count: 1},{lat: 39.9738, lng:-86.1765, count: 1},{lat: 33.7438, lng:-117.866, count: 1},{lat: 37.5741, lng:-122.321, count: 1},{lat: 42.2843, lng:-85.2293, count: 1},{lat: 34.6574, lng:-92.5295, count: 1},{lat: 41.4881, lng:-87.4424, count: 1},{lat: 25.72, lng:-80.2707, count: 1},{lat: 34.5873, lng:-118.245, count: 1},{lat: 35.8278, lng:-78.6421, count: 1}]

function _formatResponseForEntries(response, callback) {
	var ans = [];
	async.eachSeries(response, function(res, next) {
		ans.push({
			lat: Number(res.lat),
			lng: Number(res.lng),
			count: res.entries
		});
		next();
	}, function(error) {
		if(error) {
			console.log(error);
		} else {
			callback(ans);
		}
	});
}

function _formatResponseForExits(response, callback) {
	var ans = [];
	async.eachSeries(response, function(res, next) {
		ans.push({
			lat: Number(res.lat),
			lng: Number(res.lng),
			count: res.exits
		});
		next();
	}, function(error) {
		if(error) {
			console.log(error);
		} else {
			callback(ans);
		}
	});
}

function _getDataForStation(station) {
	return  _.find(_repsonse, function(res) {
		return res.remote === station;
	});
}

module.exports = Main;
