var React = require('react');

var router = require('./routes/routes.jsx');

router.run(function(Handler) {
	React.render(<Handler/>, document.body);
});

