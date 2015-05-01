var React = require('react');
var Router = require('react-router');

var HeatMap = require('../components/heatmap.jsx');

var Main = React.createClass({
	mixins: [
		Router.State
	],

	render: function() {
		return (
			<div className="container-fluid">
				<HeatMap/>
			</div>
		);
	}
});

module.exports = Main;
