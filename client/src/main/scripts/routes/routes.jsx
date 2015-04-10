'use strict';

var React = require('react');
var Router = require('react-router');

var Route = Router.Route,
	RouterHandler = Router.RouteHandler,
	DefaultRoute = Router.DefaultRoute;

/* Views */
var Main = require('../views/view-main.jsx');

/* Default Handler */
var RootDefault = React.createClass({
	mixins: [Router.State],

	render: function(){
		return (
			<RouterHandler />
		);
	}
});

var routes = (
	<Route handler={RootDefault}>
		<DefaultRoute name="main" handler={Main} />
	</Route>
);

var router = Router.create({
	routes: routes,
	onError: function(error) {
		console.log(error);
	}
});

module.exports = router;
