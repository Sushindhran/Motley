'use strict';

var React = require('react');
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouterHandler = Router.RouteHandler;

/* Views */
var Main = require('../views/view-main.jsx');
var Charts = require('../views/view-charts.jsx');
var Usage = require('../views/view-usage.jsx');

/* Default Handler */
var RootDefault = React.createClass({
	contextTypes: {
		router: React.PropTypes.func
	},

	render: function(){
		return (
			<RouterHandler/>
		);
	}
});

var routes = (
	<Route handler={RootDefault}>
		<DefaultRoute handler={Main}/>
		<Route path="/charts" name="charts" handler={Charts}/>
		<Route path="/usage" name="usage" handler={Usage}/>
	</Route>
);

var router = Router.create({
	routes: routes,
	onError: function(error) {
		console.log(error);
	}
});

module.exports = router;