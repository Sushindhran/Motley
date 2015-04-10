var React = require('react');
var Router = require('react-router');

var Header = require('../components/header/header.jsx');
var NavBar = require('../components/navbar/navbar.jsx');
var Grid = require('../components/image-grid/grid.jsx');

var Main = React.createClass({
	mixins: [
		Router.State
	],

	render: function() {
		return (
			<div className="container-fluid">
				<Header/>
				<NavBar/>
				<Grid/>
			</div>
		);
	}
});

module.exports = Main;
