'use strict';

var mongoose = require('mongoose/'),
	Schema = mongoose.Schema,
	Schemas = {};

Schema.turnstileData = {
	remote: String,
	date: Date,
	time: String,
	description: String,
	entries: String,
	exits: String,
	lat: String,
	lng: String,
	station: String
};

exports.Schemas = Schemas;