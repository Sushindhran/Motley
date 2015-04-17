var querystring = require('querystring');
var OAuth = require('oauth').OAuth;

var Client = function(oauth_config) {
	this.oauthToken = oauth_config.token;
	this.oauthTokenSecret = oauth_config.token_secret;

	this.oauth = new OAuth(
		null,
		null,
		oauth_config.consumer_key,
		oauth_config.consumer_secret,
		oauth_config.version || "1.0",
		null,
		'HMAC-SHA1'
	);

	return this;
};

var base_url = "http://api.yelp.com/v2/";

Client.prototype.get = function(resource, params, callback) {
	return this.oauth.get(
		base_url + resource + '?' + querystring.stringify(params),
		this.oauthToken,
		this.oauthTokenSecret,
		function(error, data, response) {
			if(!error) data = JSON.parse(data);
			callback(error, data, response);
		}
	);
}

Client.prototype.search = function(params, callback) {
	return this.get('search', params, callback);
}

Client.prototype.business = function(id, callback) {
	return this.get('business/' + id, null, callback);
}

Client.prototype.phone_search = function(params, callback) {
	return this.get('phone_search', params, callback);
}

// @see http://www.yelp.com/developers/documentation/v2/authentication
module.exports.createClient = function(oauth_config) {
	return new Client(oauth_config);
};

//TODO: Get dev keys for yelp
var yelp = require("yelp").createClient({
	consumer_key: "consumer-key",
	consumer_secret: "consumer-secret",
	token: "token",
	token_secret: "token-secret"
});

// See http://www.yelp.com/developers/documentation/v2/search_api
yelp.search({term: "food", location: "Montreal"}, function(error, data) {
	console.log(error);
	console.log(data);
});

yelp.business("yelp-san-francisco", function(error, data) {
	console.log(error);
	console.log(data);
});