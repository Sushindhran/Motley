'use strict';

var React = require('react');
var Router = require('react-router');

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;

/* Views */
var Main = require('../views/view-main.jsx');

/* Default Handler */
var RootDefault = React.createClass({
	contextTypes: {
		router: React.PropTypes.func
	},

	render: function(){
		return (
			<Main/>
		);
	}
});

var routes = (
	<Route handler={RootDefault}>

	</Route>
);

var router = Router.create({
	routes: routes,
	onError: function(error) {
		console.log(error);
	}
});

module.exports = router;